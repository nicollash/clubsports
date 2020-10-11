/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useEffect } from 'react';
import { List, ListRowProps } from 'react-virtualized';
import useOnclickOutside from 'react-cool-onclickoutside';
import { isEqual } from 'lodash-es';
import styles from './styles.module.scss';
import { Input, Checkbox, Button } from 'components/common';
import { getIcon } from 'helpers';
import { Icons } from 'common/enums';

export interface IMultiSelectOption {
  label: string;
  value: string;
  checked: boolean;
}

interface IProps {
  label?: string;
  name: string;
  inputValue?: string;
  placeholder?: string;
  selectOptions: IMultiSelectOption[];
  onChange: (name: string, options: IMultiSelectOption[]) => void;
  width?: string;
}

const MultiSelect = (props: IProps) => {
  const {
    label,
    placeholder = 'Select',
    width,
    selectOptions,
    name,
    onChange,
  } = props;

  const ref = useRef(null);
  const [listOpen, setListOpen] = useState(false);
  const [options, setOptions] = useState(selectOptions);
  const [filteredOptions, setFilteredOptions] = useState(selectOptions);
  const [inputValue, setInputValue] = useState('');
  const [all, setAll] = useState(false);

  useEffect(() => {
    setOptions(selectOptions);
  }, [selectOptions]);

  useEffect(() => {
    const newOptions = options.filter(item =>
      searchIncludes(item.label, inputValue)
    );
    setFilteredOptions(newOptions);
  }, [inputValue, options]);

  useEffect(() => {
    if (!isEqual(selectOptions, options)) {
      onChange(name, options);
    }
  }, [options]);

  useEffect(() => {
    const myOptions = inputValue ? filteredOptions : options;
    setAll(
      !!myOptions.length && myOptions.every(optionItem => optionItem.checked)
    );
  }, [options, filteredOptions]);

  useOnclickOutside(ref, () => {
    setListOpen(false);
    setInputValue('');
  });

  const openList = () => setListOpen(true);

  const updateInputValue = (e: any) => setInputValue(e.target.value);

  const searchIncludes = (label: string, search: string) =>
    label?.toLowerCase().includes(search?.toLowerCase());

  const onSelect = (event: any, checked: boolean) => {
    const name = event.target.name;
    const newOptions = options.map(item =>
      item?.value === name ? { ...item, checked } : item
    );
    setOptions(newOptions);
    setFilteredOptions(newOptions);
  };

  const onSetAll = () => {
    const newOptions = options.map(item => ({
      ...item,
      checked: searchIncludes(item.label, inputValue) && !all,
    }));

    setOptions(newOptions);
    setFilteredOptions(newOptions);
  };

  const onButtonClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const newOptions = options.map(item => ({
      ...item,
      checked: Boolean(searchIncludes(item.label, inputValue) && item.checked),
    }));

    if (filteredOptions.length) {
      setOptions(newOptions);
      setFilteredOptions(newOptions);
    }

    setListOpen(false);
    setInputValue('');
  };

  const onKeyDown = (e: any) => {
    if (e.keyCode !== 13) return;
    onButtonClick(e);
  };

  const onClear = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    const newOptions = options.map(item => ({
      ...item,
      checked: true,
    }));

    setOptions(newOptions);
    setFilteredOptions(newOptions);
  };

  const renderAllOption = ({ key, style }: ListRowProps) => (
    <div key={key} style={style}>
      <Checkbox
        options={[
          {
            label: 'All',
            checked: all,
          },
        ]}
        onChange={onSetAll}
      />
    </div>
  );

  const renderOption = ({ key, index, style }: ListRowProps) => (
    <div key={key} style={style}>
      <Checkbox
        options={[
          {
            ...(inputValue ? filteredOptions : options)[index - 1],
            name: (inputValue ? filteredOptions : options)[index - 1]?.value,
          },
        ]}
        onChange={onSelect}
      />
    </div>
  );

  const rowRenderer = (listProps: ListRowProps) => {
    switch (listProps.index) {
      case 0 && filteredOptions.length:
        return renderAllOption(listProps);
      case 0 && !filteredOptions.length:
        return <div key={listProps?.key} />;
      default:
        return renderOption(listProps);
    }
  };

  const rowCount = (inputValue ? filteredOptions?.length : options?.length) + 1;

  const inputPlaceholder = options.every(item => item.checked)
    ? 'All'
    : options.some(item => item.checked)
    ? options
        .filter(item => item.checked)
        .map(item => item.label)
        .join(', ')
    : placeholder;

  return (
    <div
      ref={ref}
      onClick={openList}
      onKeyDown={onKeyDown}
      className={styles.container}
      style={{ width: width ? width : '100%' }}
    >
      <div className={styles.inputWrapper}>
        <Input
          label={label}
          value={inputValue}
          placeholder={inputPlaceholder}
          width='100%'
          onChange={updateInputValue}
        />
        <div
          className={styles.iconWrapper}
          style={{ top: label ? '40px' : undefined }}
        >
          <div className={styles.cancelButton} onClick={onClear}>
            {getIcon(Icons.CLEAR)}
          </div>
          {getIcon(listOpen ? Icons.DROPUP : Icons.DROPDOWN)}
        </div>
      </div>
      <div
        className={`${styles.selectList} ${listOpen &&
          styles.selectListExpanded}`}
        style={{ width }}
      >
        <List
          width={width ? parseInt(width) : 159}
          height={260}
          rowCount={rowCount || 0}
          rowHeight={50}
          rowRenderer={rowRenderer}
          style={{ outline: 'none', width }}
        />
        <Button
          label="Select"
          variant="contained"
          color="primary"
          type="squared"
          onClick={onButtonClick}
        />
      </div>
    </div>
  );
};

export default MultiSelect;
