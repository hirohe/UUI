import React, { useRef, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { UUIFunctionComponent, UUIFunctionComponentProps } from '../../core';
import { useClickAway, useLockBodyScroll } from 'react-use';
import ReactDOM from 'react-dom';
import ReactHelper from '../../utils/ReactHelper';
import { KeyCode } from '../../utils/keyboardHelper';
import FocusTrap from 'focus-trap-react';

export interface DialogFeatureProps {
  /**
   * Toggles the visibility of the overlay and its children.
   * This prop is required because the component is controlled.
   */
  open: boolean;
  /**
   * Callback invoked when user click outside of content view.
   */
  onClickAway?: () => void;
  /**
   * Callback invoked when user close dialog
   */
  onClose?: () => void;
  /**
   * Whether lock focus on the backdrop element while Dialog is active
   * @default true
   */
  focusTrap?: boolean;
  /**
   * Whether the content of Dialog should be rendered inside a `Portal` where appending inside `portalContainer`(if it provided) or `document.body`.
   * @default true
   */
  usePortal?: boolean;
  /**
   * The container element into which the overlay renders its contents, when `usePortal` is `true`.
   * This prop is ignored if `usePortal` is `false`.
   * @default document.body
   */
  portalContainer?: HTMLElement;
  /**
   * Whether lock scrolling on the body element while Dialog is active
   */
  lockBodyScroll?: boolean;
  /**
   * The content of this dialog
   */
  children?: React.ReactNode | string;
}

export const Dialog = UUIFunctionComponent({
  name: 'Dialog',
  nodes: {
    Root: 'div',
    Portal: 'div',
    Backdrop: 'div',
    Content: 'div',
  }
}, (props: DialogFeatureProps, nodes) => {
  const { Root, Portal, Backdrop, Content } = nodes

  /**
   * handle optional props default value
   */
  const finalProps = {
    usePortal: props.usePortal === undefined ? true : props.usePortal,
    portalContainer: props.portalContainer || ReactHelper.document?.body,
    lockBodyScroll: props.lockBodyScroll === undefined ? true : props.lockBodyScroll,
    focusTrap: props.focusTrap === undefined ? true : props.focusTrap
  }

  useLockBodyScroll(props.open && !!finalProps.lockBodyScroll)

  const clickAwayRef = useRef<any>(null)
  useClickAway(clickAwayRef, () => {
    if (props.open) {
      props.onClickAway && props.onClickAway()
    }
  })

  const restoreElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (props.open) {
      restoreElement.current = document.activeElement as HTMLElement
    } else {
      restoreElement.current?.focus()
      restoreElement.current = null
    }
  }, [props.open])

  const backdrop = (
    <FocusTrap active={props.open && finalProps.focusTrap}>
      <Backdrop
        className={classNames({
          'STATE_opened': props.open
        })}
      >
        <Content
          role="dialog"
          aria-modal={props.open}
          ref={clickAwayRef}
          tabIndex={0}
          onKeyDown={(event) => {
            switch (event.keyCode) {
              case KeyCode.Escape:
                if (props.open) {
                  props.onClose && props.onClose()
                }
                break
              default:
                // do nothing
            }
          }}
        >
          {props.children}
        </Content>
      </Backdrop>
    </FocusTrap>
  )
  const wrappedBackdrop = useMemo(() => {
    return (finalProps.usePortal && finalProps.portalContainer)
    ? ReactDOM.createPortal(<Portal>{backdrop}</Portal>, finalProps.portalContainer)
    : <Portal>{backdrop}</Portal>
  }, [backdrop, finalProps.portalContainer, finalProps.usePortal]);
  return (
    <Root>
      {wrappedBackdrop}
    </Root>
  )
})

export type DialogProps = UUIFunctionComponentProps<typeof Dialog>