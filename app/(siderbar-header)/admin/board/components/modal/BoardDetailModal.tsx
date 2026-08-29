// app/(sidebar-header)/admin/board/components/modal/BoardDetailModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store";
import { useAdminBoardStore } from "../../store";
import type { BoardReply, ReplyingTo } from "../../types";

import { useShowDeletedReplies } from "./_hooks/useShowDeletedReplies";
import { useReplyThreads } from "./_hooks/useReplyThreads";
import { ShowDeletedToggle } from "./_components/ShowDeletedToggle";
import { ReplyComposer } from "./_components/ReplyComposer";
import { ReplyThreadCard } from "./_components/ReplyThreadCard";
import { formatDate, truncateText } from "@/lib/utils/utils";

const EMPTY_REPLIES: BoardReply[] = [];

type Props = { open: boolean; id: string; onClose: () => void };

export default function BoardDetailModal({ open, id, onClose }: Props) {
  const { user } = useStore();

  const getById = useAdminBoardStore((s) => s.getById);
  const openModal = useAdminBoardStore((s) => s.open);

  const replyCreate = useAdminBoardStore((s) => s.replyCreate);
  const replyFetch = useAdminBoardStore((s) => s.replyFetch);
  const replyUpdate = useAdminBoardStore((s) => s.replyUpdate);
  const replyDelete = useAdminBoardStore((s) => s.replyDelete);

  const repliesRaw = useAdminBoardStore((s) => s.repliesByPostId[id]);
  const repliesAll: BoardReply[] = Array.isArray(repliesRaw) ? repliesRaw : EMPTY_REPLIES;

  const { showDeleted, setShowDeleted } = useShowDeletedReplies(open);

  const replies: BoardReply[] = useMemo(() => {
    if (showDeleted) return repliesAll;
    return repliesAll.filter((r) => !r.deleted);
  }, [repliesAll, showDeleted]);

  const { threads, directReplyCountById } = useReplyThreads(replies);

  const [collapsedThreads, setCollapsedThreads] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [replyingTo, setReplyingTo] = useState<ReplyingTo>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const row = useMemo(() => (open && id ? getById(id) : undefined), [open, id, getById]);

  useEffect(() => {
    if (!open || !id) return;
    replyFetch(id);

  }, [open, id]);

  useEffect(() => {
    if (!open) {
      setReplyText("");
      setSubmitting(false);
      setReplyingTo(null);
      setEditingId(null);
      setEditingText("");
      setSavingEdit(false);
    }
  }, [open]);

  const canSubmit = replyText.trim().length > 0;

  function canManageReply(r: BoardReply) {
    const isOwner = String(r.authorId) === String(user.sub);
    const isAdmin = (user.roles ?? []).includes("admin");
    return isOwner || isAdmin;
  }

  function startEdit(r: BoardReply) {
    if (!r.id) return;
    setEditingId(String(r.id));
    setEditingText(r.content ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingText("");
  }

  async function submitEdit(replyId: string) {
    if (!editingText.trim()) return;
    try {
      setSavingEdit(true);
      await replyUpdate({ postId: id, replyId, content: editingText, actorRoles: user.roles });
      cancelEdit();
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeReply(replyId: string) {
    const ok = window.confirm("이 댓글을 삭제할까요? (삭제된 댓글로 표시됩니다)");
    if (!ok) return;
    await replyDelete({ postId: id, replyId, actorRoles: user.roles });
  }

  async function onSubmitReply() {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await replyCreate({
        postId: id,
        parentId: replyingTo?.id ?? null,
        content: replyText,
      });
      setReplyText("");
      setReplyingTo(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl shadow-black/20 ring-1 ring-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">상세 보기</div>
            <div className="mt-1 text-xs text-gray-500">게시글 상세 모달</div>
          </div>
          <div className="flex items-center gap-2">
            {row ? (
              <>
                <button
                  onClick={() => openModal({ type: "edit", id: row.id })}
                  className="rounded-full bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-black/5 hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={() => openModal({ type: "delete", id: row.id })}
                  className="rounded-full bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-black/5 hover:bg-gray-50"
                >
                  삭제
                </button>
              </>
            ) : null}
            <button
              onClick={onClose}
              className="rounded-full bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-black/5 hover:bg-gray-50"
            >
              닫기
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-auto px-6 py-5">
          {!row ? (
            <div className="rounded-3xl bg-gray-50 p-10 text-center text-sm text-gray-500 ring-1 ring-black/5">
              데이터를 찾을 수 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {/* 게시글 카드 */}
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <div className="text-xs text-gray-500">ID</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{row.id}</div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-gray-500">카테고리</div>
                    <div className="mt-1 text-sm text-gray-900">{row.slug}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">작성자</div>
                    <div className="mt-1 text-sm text-gray-900">{row.authorName}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">제목</div>
                  <div className="mt-1 text-base font-semibold text-gray-900 whitespace-pre-wrap break-words">
                    {row.title}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">내용</div>
                  <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap break-words">{row.content}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(row.tags ?? []).map((t: string) => (
                    <span key={t} className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-700 ring-1 ring-black/5">
                      #{t}
                    </span>
                  ))}
                  {row.hasPassword ? (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 ring-1 ring-black/5">
                      🔒 비밀글
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 text-xs text-gray-500">
                  createdAt: {formatDate(row.createdAt)} / updatedAt:{" "}
                  {row.updatedAt ? formatDate(row.updatedAt) : "-"}
                </div>
              </div>

              {/* 댓글 영역 */}
              <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      댓글 <span className="ml-1 text-xs font-normal text-gray-500">({replies.length})</span>
                    </div>

                    {replyingTo ? (
                      <div className="mt-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 ring-1 ring-emerald-200">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="text-emerald-600">↳</span>
                          <span>
                            <b>{replyingTo.authorName}</b>님의 댓글에 답글 작성 중
                          </span>
                        </div>

                        {replyingTo.preview ? (
                          <div className="mt-1 line-clamp-2 text-[11px] text-emerald-700">
                            “{truncateText(replyingTo.preview, 15)}”
                          </div>
                        ) : null}

                        {replyingTo.depth !== undefined ? (
                          <div className="mt-1 text-[11px] text-emerald-600">
                            depth {replyingTo.depth} · {replyingTo.depth === 0 ? "최상위 댓글" : "답글"}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <ShowDeletedToggle
                    showDeleted={showDeleted}
                    onToggle={() => setShowDeleted((v) => !v)}
                  />
                </div>

                <ReplyComposer
                  open={open}
                  replyText={replyText}
                  onChange={setReplyText}
                  canSubmit={canSubmit}
                  submitting={submitting}
                  onSubmit={onSubmitReply}
                  replyingTo={replyingTo}
                  onCancelReplyingTo={() => setReplyingTo(null)}
                />

                {/* 댓글 리스트(threads) */}
                <div className="border-t border-gray-100 bg-gray-50/40 px-3 py-4">
                  {threads.length === 0 ? (
                    <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 ring-1 ring-black/5">
                      아직 댓글이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {threads.map(({ threadId, root, items }) => (
                        <ReplyThreadCard
                          key={threadId}
                          threadId={threadId}
                          root={root}
                          items={items}
                          isCollapsed={collapsedThreads[threadId] ?? false}
                          onToggleCollapse={(tid) => setCollapsedThreads((m) => ({ ...m, [tid]: !(m[tid] ?? false) }))}
                          setReplyingTo={setReplyingTo}
                          canManageReply={canManageReply}
                          onStartEdit={startEdit}
                          onCancelEdit={cancelEdit}
                          onSubmitEdit={submitEdit}
                          onRemoveReply={removeReply}
                          editingId={editingId}
                          editingText={editingText}
                          onChangeEditingText={setEditingText}
                          savingEdit={savingEdit}
                          directReplyCountById={directReplyCountById}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
