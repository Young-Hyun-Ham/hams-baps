// (Handle, Position 임포트 제거)
import styles from './ChatNodes.module.css';
import { useBuilderStore } from '../../store/index';
// (AnchorIcon, StartNodeIcon 임포트 제거)
import { formatDisplayKeys } from '../../utils/gridUtils';
import NodeWrapper from './NodeWrapper';
import { useTranslation } from 'react-i18next';
import { DisplayValue, FormElement } from '../../form-builder/type';

type FormNodeProps = {
  id: string;
  data: {
    title?: string;
    enableExcelUpload?: boolean;
    elements?: FormElement[];
  };
};

function FormNode({ id, data }: FormNodeProps) {
  const { t } = useTranslation();
  // 2. 공통 로직 제거
  const nodeColor = useBuilderStore((state) => state.nodeColors.form);
  const textColor = useBuilderStore((state) => state.nodeTextColors.form);

  const normalizeOption = (
    option: string | DisplayValue,
    fallbackIndex: number,
  ) => {
    if (option && typeof option === 'object') {
      const value = option.value ?? `Option ${fallbackIndex + 1}`;
      return {
        value: String(value),
        label: String(option.label ?? value),
        param: option.param,
      };
    }

    const value = option ?? `Option ${fallbackIndex + 1}`;
    return {
      value: String(value),
      label: String(value),
    };
  };

  const fallbackOptions = [
    { value: 'Option 1', label: 'Option 1' },
    { value: 'Option 2', label: 'Option 2' },
  ];

  const renderElementPreview = (element: FormElement) => {
    // ... (기존 renderElementPreview 함수 내용은 동일)
    switch (element.type) {
      case 'input':
        return (
          <div key={element.id} className={styles.previewElement}>
            <label className={styles.previewLabel}>
              {element.label || 'Input'}
            </label>
            <input
              type={
                element.validation.type === 'email'
                  ? 'email'
                  : element.validation.type === 'number'
                    ? 'number'
                    : 'text'
              }
              className={styles.previewInput}
              placeholder={element.placeholder || ''}
              value={element.defaultValue ?? ''}
              readOnly
            />
          </div>
        );
      case 'search':
        return (
          <div key={element.id} className={styles.previewElement}>
            <label className={styles.previewLabel}>
              {element.label || 'Search'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="text"
                className={styles.previewInput}
                placeholder={element.placeholder || ''}
                readOnly
                value={element.defaultValue || ''}
                style={{ flexGrow: 1 }}
              />
              <span style={{ padding: '0 4px', fontSize: '1.2rem' }}>🔍</span>
            </div>
            {element.resultSlot && (
              <div className={styles.slotBindingInfo}>
                {t('Result Slot')}: {`{${element.resultSlot}}`}
              </div>
            )}
          </div>
        );
      case 'date': {
        const fromDateValue = element.hasFromTo
          ? element.fromDateValue ||
            element.defaultFromValue ||
            element.defaultValue ||
            ''
          : element.dateValue || element.defaultValue || '';
        const toDateValue =
          element.toDateValue || element.defaultToValue || '';
        const fromTimeValue =
          element.fromTimeValue ||
          element.defaultFromTimeValue ||
          element.defaultTimeValue ||
          '';
        const toTimeValue =
          element.toTimeValue ||
          element.defaultToTimeValue ||
          element.defaultTimeValue ||
          '';

        return (
          <div key={element.id} className={styles.previewElement}>
            <label className={styles.previewLabel}>
              {element.label || 'Date'}
            </label>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '4px',
                minWidth: 0,
              }}
            >
              <input
                type="date"
                className={styles.previewInput}
                value={fromDateValue}
                readOnly
                style={{ flex: '1 1 120px', minWidth: 0 }}
              />
              {element.hasTime && (
                <input
                  type="time"
                  className={styles.previewInput}
                  value={fromTimeValue}
                  readOnly
                  step={60}
                  style={{ flex: '1 1 100px', minWidth: 0 }}
                />
              )}
              {element.hasFromTo && (
                <>
                  <input
                    type="date"
                    className={styles.previewInput}
                    value={toDateValue}
                    readOnly
                    style={{ flex: '1 1 120px', minWidth: 0 }}
                  />
                  {element.hasTime && (
                    <input
                      type="time"
                      className={styles.previewInput}
                      value={toTimeValue}
                      readOnly
                      step={60}
                      style={{ flex: '1 1 100px', minWidth: 0 }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        );
      }
      case 'grid':
        return (
          <div key={element.id} className={styles.previewElement}>
            <label className={styles.previewLabel}>
              {element.label || 'Grid'}
            </label>
            {element.optionsSlot && (
              <div className={styles.slotBindingInfo}>
                {t('Bound to')}: {`{${element.optionsSlot}}`}
              </div>
            )}
            {/* --- 💡 수정된 부분 시작 (formatDisplayKeys 헬퍼 사용) --- */}
            {element.optionsSlot &&
              element.displayKeys &&
              element.displayKeys.length > 0 && (
                <div
                  className={styles.slotBindingInfo}
                  style={{
                    fontStyle: 'normal',
                    color: '#555',
                    fontSize: '0.7rem',
                  }}
                >
                  {t('Displaying')}: {formatDisplayKeys(element.displayKeys)}
                </div>
              )}
            {/* --- 💡 수정된 부분 끝 --- */}
            <table className={styles.previewGridTable}>
              {element.hasHeader ? (
                <>
                  <thead>
                    <tr>
                      {element.selectable && <th style={{ width: '30px' }} />}
                      {[...Array(element.columns || 2)].map((_, colIndex) => {
                        const cellValue =
                          element.data && element.data[colIndex] !== undefined
                            ? element.data[colIndex]
                            : '';
                        return <th key={colIndex}>{cellValue}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(Math.max((element.rows || 2) - 1, 0))].map(
                      (_, rIdx) => {
                        const rowIndex = rIdx + 1;
                        return (
                          <tr key={rowIndex}>
                            {element.selectable && (
                              <td
                                style={{ width: '30px', textAlign: 'center' }}
                              >
                                <input type="checkbox" readOnly disabled />
                              </td>
                            )}
                            {[...Array(element.columns || 2)].map(
                              (_, colIndex) => {
                                const cellIndex =
                                  rowIndex * (element.columns || 2) + colIndex;
                                const cellValue =
                                  element.data &&
                                  element.data[cellIndex] !== undefined
                                    ? element.data[cellIndex]
                                    : '';
                                return <td key={colIndex}>{cellValue}</td>;
                              },
                            )}
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </>
              ) : (
                <tbody>
                  {[...Array(element.rows || 2)].map((_, rowIndex) => (
                    <tr key={rowIndex}>
                      {element.selectable && (
                        <td style={{ width: '30px', textAlign: 'center' }}>
                          <input type="checkbox" readOnly disabled />
                        </td>
                      )}
                      {[...Array(element.columns || 2)].map((_, colIndex) => {
                        const cellIndex =
                          rowIndex * (element.columns || 2) + colIndex;
                        const cellValue =
                          element.data && element.data[cellIndex] !== undefined
                            ? element.data[cellIndex]
                            : '';
                        return <td key={colIndex}>{cellValue}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        );
      case 'checkbox':
        const checkboxDefaultValues = Array.isArray(element.defaultValue)
          ? element.defaultValue.map(String)
          : [];

        return (
          <div key={element.id} className={styles.previewElement}>
            <label className={styles.previewLabel}>
              {element.label || 'Checkbox'}
            </label>
            <div
              className={styles.previewOptionsContainer}
              style={{
                display: 'grid',
                gridTemplateColumns:
                  element.optionLayout === 'horizontal'
                    ? `repeat(${Math.max(1, element.optionsPerRow ?? 2)}, minmax(0, 1fr))`
                    : 'minmax(0, 1fr)',
                columnGap: '8px',
                rowGap: '4px',
              }}
            >
              {(element.options && element.options.length > 0
                ? element.options
                : fallbackOptions
              ).map((opt, i) => {
                const option = normalizeOption(opt, i);
                return (
                  <div
                    key={option.value || i}
                    className={styles.previewCheckbox}
                  >
                    <input
                      type="checkbox"
                      id={`${element.id}-${i}`}
                      checked={checkboxDefaultValues.includes(option.value)}
                      readOnly
                    />
                    <label htmlFor={`${element.id}-${i}`}>{option.label}</label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'radio':
        return (
          <div key={element.id} className={styles.previewElement}>
            <label className={styles.previewLabel}>
              {element.label || 'Radio'}
            </label>
            <div
              className={styles.previewOptionsContainer}
              style={{
                display: 'grid',
                gridTemplateColumns:
                  element.optionLayout === 'horizontal'
                    ? `repeat(${Math.max(1, element.optionsPerRow ?? 2)}, minmax(0, 1fr))`
                    : 'minmax(0, 1fr)',
                columnGap: '8px',
                rowGap: '4px',
              }}
            >
              {(element.options && element.options.length > 0
                ? element.options
                : fallbackOptions
              ).map((opt, i) => {
                const option = normalizeOption(opt, i);

                return (
                  <div
                    key={option.value || i}
                    className={styles.previewCheckbox}
                  >
                    <input
                      type="radio"
                      name={`${element.id}-preview`}
                      id={`${element.id}-${i}`}
                      checked={element.defaultValue === option.value}
                      readOnly
                    />
                    <label htmlFor={`${element.id}-${i}`}>{option.label}</label>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'dropbox': {
        // optionsSlot이 있고, fallback 옵션이 없으면 기본 옵션 표시
        const displayOptions =
          element.optionsSlot &&
          (!element.options || element.options.length === 0)
            ? fallbackOptions
            : element.options || fallbackOptions;

        const isMultiSelect = element.selectKind === 'multi';
        const selectedValues = Array.isArray(element.defaultValue)
          ? element.defaultValue.map(String)
          : element.defaultValue
            ? [String(element.defaultValue)]
            : [];

        return (
          <div key={element.id} className={styles.previewElement}>
            <label className={styles.previewLabel}>
              {element.label || 'Dropbox'}
            </label>
            {element.optionsSlot && (
              <div className={styles.slotBindingInfo}>
                {t('Bound to')}: {`{${element.optionsSlot}}`}
              </div>
            )}
            <select
              className={styles.previewInput}
              multiple={isMultiSelect}
              value={isMultiSelect ? selectedValues : (selectedValues[0] ?? '')}
              disabled
              style={{ whiteSpace: 'nowrap' }}
            >
              {displayOptions.map((opt, i) => {
                const option = normalizeOption(opt, i);

                return (
                  <option key={option.value || i} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </select>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    // 3. NodeWrapper로 감싸기
    <NodeWrapper
      id={id}
      typeLabel="Form"
      icon={null} // (FormNode는 아이콘이 없었음)
      nodeColor={nodeColor}
      textColor={textColor}
      customClassName={styles.formNodeWrapper} // 4. 너비 조절을 위한 커스텀 클래스 전달
    >
      {/* 5. 기존 nodeBody의 내용만 children으로 전달 */}
      <div className={styles.section}>
        {/* Form Title is now readOnly, edited in Controller */}
        <input
          className={`${styles.textInput} ${styles.formTitleInput}`}
          value={data.title ?? ''}
          readOnly // Controller에서 수정하므로 readOnly로 변경
          placeholder={t('Form Title')}
        />
        {data.enableExcelUpload && (
          <div className={styles.formFeatureIndicator}>
            ({t('Excel Upload Enabled')})
          </div>
        )}
      </div>
      <div className={styles.formPreview}>
        {data.elements && data.elements.length > 0 ? (
          data.elements.map(renderElementPreview)
        ) : (
          <div className={styles.formElementsPlaceholder}>
            {t('No elements added yet')}.
          </div>
        )}
      </div>
    </NodeWrapper>
  );
}

export default FormNode;
