/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {GridCollection, useGridState} from '@react-stately/grid';
import {mergeProps} from '@react-aria/utils';
import React, {ReactElement, useMemo} from 'react';
import {SpectrumTagGroupProps} from '@react-types/tag';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {Tag} from './Tag';
import {TagKeyboardDelegate, useTagGroup} from '@react-aria/tag';
import {useGrid} from '@react-aria/grid';
import {useListState} from '@react-stately/list';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';


function TagGroup<T extends object>(props: SpectrumTagGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    allowsRemoving,
    onRemove,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);
  let {direction} = useLocale();
  let listState = useListState(props);
  let gridCollection = useMemo(() => new GridCollection({
    columnCount: 1, // unused, but required for grid collections
    items: [...listState.collection].map(item => {
      let childNodes = [{
        ...item,
        index: 0,
        type: 'cell'
      }];

      return {
        type: 'item',
        childNodes
      };
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [listState.collection, allowsRemoving]);
  let state = useGridState({
    ...props,
    collection: gridCollection,
    focusMode: 'cell'
  });
  let keyboardDelegate = new TagKeyboardDelegate({
    collection: state.collection,
    disabledKeys: new Set(),
    ref: domRef,
    direction,
    focusMode: 'cell'
  });
  let {gridProps} = useGrid({
    ...props,
    keyboardDelegate
  }, state, domRef);
  const {tagGroupProps} = useTagGroup(props);

  // Don't want the grid to be focusable or accessible via keyboard
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let {tabIndex, role, ...otherGridProps} = gridProps;
  return (
    <div
      {...mergeProps(styleProps, tagGroupProps, otherGridProps)}
      className={
        classNames(
          styles,
          'spectrum-Tags',
          styleProps.className
        )
      }
      role={state.collection.size ? 'grid' : null}
      ref={domRef}>
      {[...gridCollection].map(item => (
        <Tag
          {...item.childNodes[0].props}
          key={item.key}
          item={item}
          state={state}
          allowsRemoving={allowsRemoving}
          onRemove={onRemove}>
          {item.childNodes[0].rendered}
        </Tag>
        ))}
    </div>
  );
}

const _TagGroup = React.forwardRef(TagGroup) as <T>(props: SpectrumTagGroupProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_TagGroup as TagGroup};
