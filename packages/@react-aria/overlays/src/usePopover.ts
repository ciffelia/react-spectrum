/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ariaHideOutside} from './ariaHideOutside';
import {AriaPositionProps, useOverlayPosition} from './useOverlayPosition';
import {DOMAttributes} from '@react-types/shared';
import {mergeProps, useLayoutEffect} from '@react-aria/utils';
import {OverlayContext} from './Overlay';
import {OverlayTriggerState} from '@react-stately/overlays';
import {PlacementAxis} from '@react-types/overlays';
import {RefObject, useContext} from 'react';
import {useOverlay} from './useOverlay';
import {usePreventScroll} from './usePreventScroll';

export interface AriaPopoverProps extends Omit<AriaPositionProps, 'isOpen' | 'onClose' | 'targetRef' | 'overlayRef'> {
  /**
   * The ref for the element which the popover positions itself with respect to.
   */
  triggerRef: RefObject<Element>,
  /**
   * The ref for the popover element.
   */
  popoverRef: RefObject<Element>,
  /**
   * Whether the popover is non-modal, i.e. elements outside the popover may be
   * interacted with by assistive technologies.
   *
   * Most popovers should not use this option as it may negatively impact the screen
   * reader experience. Only use with components such as combobox, which are designed
   * to handle this situation carefully.
   */
  isNonModal?: boolean,
  /**
   * Whether pressing the escape key to close the popover should be disabled.
   * @default false
   */
  isKeyboardDismissDisabled?: boolean
}

export interface PopoverAria {
  /** Props for the popover element. */
  popoverProps: DOMAttributes,
  /** Props for the popover tip arrow if any. */
  arrowProps: DOMAttributes,
  /** Props to apply to the underlay element, if any. */
  underlayProps: DOMAttributes,
  /** Placement of the popover with respect to the trigger. */
  placement: PlacementAxis
}

/**
 * Provides the behavior and accessibility implementation for a popover component.
 * A popover is an overlay element positioned relative to a trigger.
 */
export function usePopover(props: AriaPopoverProps, state: OverlayTriggerState): PopoverAria {
  let {
    triggerRef,
    popoverRef,
    isNonModal,
    isKeyboardDismissDisabled,
    ...otherProps
  } = props;

  let ctx = useContext(OverlayContext);
  let {overlayProps, underlayProps} = useOverlay(
    {
      isOpen: state.isOpen,
      onClose: state.close,
      // Close on blur if the overlay's FocusScope does not contain focus.
      shouldCloseOnBlur: ctx && !ctx.contain,
      isDismissable: !isNonModal,
      isKeyboardDismissDisabled
    },
    popoverRef
  );

  let {overlayProps: positionProps, arrowProps, placement} = useOverlayPosition({
    ...otherProps,
    targetRef: triggerRef,
    overlayRef: popoverRef,
    isOpen: state.isOpen
  });
  
  usePreventScroll({
    // Delay preventing scroll until popover is positioned to avoid extra scroll padding.
    isDisabled: isNonModal || !placement
  });

  useLayoutEffect(() => {
    if (state.isOpen && !isNonModal && popoverRef.current) {
      return ariaHideOutside([popoverRef.current]);
    }
  }, [isNonModal, state.isOpen, popoverRef]);

  return {
    popoverProps: mergeProps(overlayProps, positionProps),
    arrowProps,
    underlayProps,
    placement
  };
}
