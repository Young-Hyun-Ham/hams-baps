import { useId, useLayoutEffect, useState } from "react";
import { Popover } from "@mui/material";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";

import styles from "./ChatNodes.module.css";
import { useBuilderStore } from "../../store/index";
import { builderExecutionStore } from "../../store/builderExecutionStore";
import { AnchorIcon, StartNodeIcon } from "../icons/Icons";

import {
  Loader2,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Ellipsis,
  Pencil,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import NodeEditButton from "./NodeEditButton";
import NodeTitle from "./NodeTitle";
/**
 * 모든 노드에서 공통으로 사용되는 래퍼 컴포넌트입니다.
 * 헤더, 버튼(시작, 앵커, 삭제), 공통 스타일, 기본 핸들을 관리합니다.
 *
 * @param {object} props
 * @param {string} props.id - 노드 ID
 * @param {string} props.typeLabel - 헤더에 표시될 노드 타입 (예: "Message")
 * @param {React.ReactNode} props.icon - 헤더에 표시될 아이콘
 * @param {string} props.nodeColor - 노드 아이콘 영역 배경색
 * @param {string} props.textColor - 노드 아이콘 영역 색상
 * @param {React.ReactNode} props.children - 노드의 본문(body) 컨텐츠
 * @param {React.ReactNode} [props.handles=null] - (선택) 커스텀 핸들 (제공 시 기본 출력 핸들 대체)
 * @param {React.ReactNode} [props.headerButtons=null] - (선택) 헤더에 추가할 커스텀 버튼 (예: ApiNode의 테스트 버튼)
 * @param {string} [props.customClassName=""] - (선택) 래퍼 div에 추가할 클래스 (예: FormNode의 너비 조절용)
 * @param {object} [props.style={}] - (선택) 래퍼 div에 적용할 인라인 스타일 (예: IframeNode의 동적 너비)
 */
function NodeWrapper({
  id,
  typeLabel,
  icon,
  nodeColor,
  textColor,
  children,
  handles = null,
  headerButtons = null,
  nodeChrome = null,
  hideBody = false,
  bodyCollapsed,
  onToggleBody,
  customClassName = "",
  style = {},
}) {
  const { t } = useTranslation();
  const [localBodyCollapsed, setIsBodyCollapsed] = useState(true);
  const isBodyCollapsed = bodyCollapsed ?? localBodyCollapsed;
  const [actionsAnchor, setActionsAnchor] = useState(null);
  const actionsId = useId();
  const areActionsOpen = Boolean(actionsAnchor);
  const deleteNode = useBuilderStore((state) => state.deleteNode);
  const anchorNodeId = useBuilderStore((state) => state.anchorNodeId);
  const setAnchorNodeId = useBuilderStore((state) => state.setAnchorNodeId);
  const startNodeId = useBuilderStore((state) => state.startNodeId);
  const setStartNodeId = useBuilderStore((state) => state.setStartNodeId);
  const updateNodeInternals = useUpdateNodeInternals();

  const isAnchored = anchorNodeId === id;
  const isStartNode = startNodeId === id;

  // 플레이 추가
  const executionRunning = builderExecutionStore(
    (state) => state.executionRunning,
  );
  const executionCurrentNodeId = builderExecutionStore(
    (state) => state.executionCurrentNodeId,
  );
  const executionCompletedNodeIds = builderExecutionStore(
    (state) => state.executionCompletedNodeIds,
  );

  const isRunningNode = executionRunning && executionCurrentNodeId === id;
  const isCompletedNode = executionCompletedNodeIds.includes(id);

  const nodeType = useBuilderStore((state) => state.nodes.find((node) => node.id === id)?.type);
  const storeNodeData = useBuilderStore(
    (state) => state.nodes.find((n) => n.id === id)?.data,
  );
  const isSelectionGroupChild = useBuilderStore((state) => {
    const node = state.nodes.find((item) => item.id === id);
    if (!node?.parentNode) return false;
    return (
      state.nodes.find((item) => item.id === node.parentNode)?.type ===
      "selectionGroup"
    );
  });
  const isStandaloneRegularNode = useBuilderStore((state) => {
    const node = state.nodes.find((item) => item.id === id);
    return Boolean(
      node &&
        !node.parentNode &&
        node.type !== "selectionGroup" &&
        node.type !== "scenario",
    );
  });
  const inputPos =
    storeNodeData?.inputPosition === "top" ? Position.Top : Position.Left;
  const outputPos =
    (storeNodeData?.outputPositions?.["default"] ||
      storeNodeData?.outputPosition) === "bottom"
      ? Position.Bottom
      : Position.Right;

  useLayoutEffect(() => {
    updateNodeInternals(id);
  }, [
    id,
    inputPos,
    outputPos,
    hideBody,
    isBodyCollapsed,
    isStandaloneRegularNode,
    isSelectionGroupChild,
    updateNodeInternals,
  ]);

  return (
    <div
      data-node-type={nodeType}
      className={`${styles.nodeWrapper} ${isSelectionGroupChild ? styles.groupChildNode : ""} ${isAnchored ? styles.anchored : ""} ${isStartNode ? styles.startNode : ""} ${customClassName}`}
      style={{
        ...style,
        ...(isStandaloneRegularNode
          ? { width: isBodyCollapsed ? 250 : 420, boxSizing: "border-box" }
          : {}),
        ...(isSelectionGroupChild
          ? { width: "100%", boxSizing: "border-box" }
          : {}),
      }}
    >
      {nodeChrome}

      {/* 플레이 추가 */}
      {isRunningNode ? (
        <div
          className={`${styles.executionBadge} ${styles.executionBadgeRunning}`}
        >
          <Loader2 size={16} className={styles.executionSpinner} />
        </div>
      ) : isCompletedNode ? (
        <div
          className={`${styles.executionBadge} ${styles.executionBadgeDone}`}
        >
          <CheckCircle2 size={16} />
        </div>
      ) : null}

      {/* 1. 입력 핸들 (Left 또는 Top중 선택된 1개만 표시) */}
      <Handle
        type="target"
        position={inputPos}
        id={inputPos === Position.Top ? "input-top" : "input-left"}
        style={{
          ...(inputPos === Position.Top ? { top: -5 } : { left: -5 }),
          zIndex: 10,
          width: 10,
          height: 10,
          background: "#64748b",
          border: "2px solid #ffffff",
          cursor: "crosshair",
        }}
      />

      {/* 2. 공통 헤더 */}
      <div className={styles.nodeHeader}>
        <div className={styles.headerLeft}>
          {(!hideBody || onToggleBody) && (
            <button
              type="button"
              className={`nodrag nopan ${styles.bodyToggleButton}`}
              title={isBodyCollapsed ? "본문 펼치기" : "본문 접기"}
              aria-label={isBodyCollapsed ? "본문 펼치기" : "본문 접기"}
              aria-expanded={!isBodyCollapsed}
              onClick={(event) => {
                event.stopPropagation();
                if (onToggleBody) onToggleBody();
                else setIsBodyCollapsed((collapsed) => !collapsed);
              }}
            >
              {isBodyCollapsed ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
            </button>
          )}
          {icon && (
            <span
              className={styles.headerIcon}
              style={{ backgroundColor: nodeColor, color: textColor }}
            >
              {icon}
            </span>
          )}
          {!icon && (
            <span
              className={styles.headerColorIndicator}
              style={{ backgroundColor: nodeColor }}
              aria-hidden="true"
            />
          )}
          <NodeTitle id={id} typeLabel={typeLabel} />
        </div>
        <div className={styles.headerButtons}>
          <span className={styles.nodeTypeLabel} title={typeLabel}>
            {typeLabel}
          </span>
          <button
            type="button"
            className={`nodrag nopan ${styles.headerMoreButton}`}
            title={t("Node actions")}
            aria-label={t("Node actions")}
            aria-haspopup="dialog"
            aria-expanded={areActionsOpen}
            aria-controls={areActionsOpen ? actionsId : undefined}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              const target = event.currentTarget;
              setActionsAnchor((anchor) => (anchor ? null : target));
            }}
          >
            <Ellipsis size={18} />
          </button>
          <Popover
            id={actionsId}
            open={areActionsOpen}
            anchorEl={actionsAnchor}
            onClose={() => setActionsAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            disableScrollLock
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            slotProps={{
              paper: {
                role: "dialog",
                "aria-label": t("Node actions"),
                className: styles.headerActionsPaper,
              },
            }}
          >
            <div
              className={`nodrag nopan nowheel ${styles.headerActionsPalette}`}
              role="toolbar"
              aria-label={t("Node actions")}
              onKeyDown={(event) => {
                if (event.key !== "Escape") event.stopPropagation();
              }}
              onClickCapture={(event) => {
                const button = event.target.closest("button");
                if (button && !button.disabled) {
                  // Let the original action receive its click before unmounting.
                  window.setTimeout(() => setActionsAnchor(null), 0);
                }
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setStartNodeId(id);
                }}
                className={`${styles.startNodeButton} ${isStartNode ? styles.active : ""}`}
                title={t("Set as Start Node")}
              >
                <StartNodeIcon />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAnchorNodeId(id);
                }}
                className={`${styles.anchorButton} ${isAnchored ? styles.active : ""}`}
                title={t("Set as anchor")}
              >
                <AnchorIcon />
              </button>
              {/* 2a. (선택) 추가 헤더 버튼 */}
              {headerButtons}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(id);
                }}
                className={styles.deleteButton}
              >
                <X />
              </button>
            </div>
          </Popover>
        </div>
      </div>

      {/* 3. 노드별 본문 컨텐츠 */}
      {!hideBody && (
        <div
          className={styles.nodeBody}
          style={isBodyCollapsed ? { display: "none" } : undefined}
        >
          {children}
          <NodeEditButton id={id} />
        </div>
      )}

      {/* 4. (선택) 커스텀 핸들 또는 기본 출력 핸들 (Right 또는 Bottom 중 선택된 1개만 표시) */}
      {handles ? (
        handles
      ) : (
        <Handle
          type="source"
          position={outputPos}
          id={outputPos === Position.Bottom ? "output-bottom" : "output-right"}
          style={{
            ...(outputPos === Position.Bottom ? { bottom: -5 } : { right: -5 }),
            zIndex: 10,
            width: 10,
            height: 10,
            background: "#64748b",
            border: "2px solid #ffffff",
            cursor: "crosshair",
          }}
        />
      )}
    </div>
  );
}

export default NodeWrapper;
