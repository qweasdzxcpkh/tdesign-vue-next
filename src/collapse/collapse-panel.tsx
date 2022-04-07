import { defineComponent, ref, computed, inject, Ref, toRefs, Transition } from 'vue';
import props from './collapse-panel-props';
import FakeArrow from '../common-components/fake-arrow';
import { CollapseValue, TdCollapsePanelProps } from './type';
import { useTNodeJSX } from '../hooks/tnode';
import { usePrefixClass } from '../config-provider';
import useCollapseAnimation from './useCollapseAnimation';

export default defineComponent({
  name: 'TCollapsePanel',
  props,
  setup(props: TdCollapsePanelProps, context) {
    const renderTNodeJSX = useTNodeJSX();
    const componentName = usePrefixClass('collapse-panel');
    const disableClass = usePrefixClass('is-disabled');
    const clickableClass = usePrefixClass('is-clickable');
    const transitionClass = usePrefixClass('slide-down');
    const { value, disabled, destroyOnCollapse } = toRefs(props);
    const collapseValue: Ref<CollapseValue> = inject('collapseValue');
    const updateCollapseValue: Function = inject('updateCollapseValue');
    const {
      defaultExpandAll,
      disabled: disableAll,
      expandIconPlacement,
      expandOnRowClick,
      expandIcon,
    } = inject('collapseProps');
    if (defaultExpandAll.value) {
      updateCollapseValue(value.value);
    }
    const { beforeEnter, enter, afterEnter, beforeLeave, leave, afterLeave } = useCollapseAnimation();
    const headRef = ref<HTMLElement>();
    const isDisabled = computed(() => disabled.value || disableAll.value);
    const isActive = computed(() =>
      collapseValue.value instanceof Array
        ? collapseValue.value.includes(value.value)
        : collapseValue.value === value.value,
    );
    const classes = computed(() => {
      return [componentName.value, { [disableClass.value]: isDisabled.value }];
    });
    const handleClick = (e: MouseEvent) => {
      const canExpand =
        (expandOnRowClick.value && e.target === headRef.value) ||
        (e.target as Element).getAttribute('name') === 'arrow';
      if (canExpand && !isDisabled.value) {
        updateCollapseValue(value.value);
      }
    };
    const renderIcon = (direction: string) => {
      return (
        <FakeArrow
          name="arrow"
          isActive={isActive.value}
          overlayClassName={`${componentName.value}__icon ${componentName.value}__icon--${direction}`}
        />
      );
    };
    const renderBlank = () => {
      return <div class={`${componentName.value}__header--blank`}></div>;
    };
    const renderHeader = () => {
      const cls = [
        `${componentName.value}__header`,
        {
          [clickableClass.value]: expandOnRowClick.value && !isDisabled.value,
        },
      ];
      return (
        <div ref={headRef} class={cls} onClick={handleClick}>
          {expandIcon.value && expandIconPlacement.value === 'left' ? renderIcon(expandIconPlacement.value) : null}
          {renderTNodeJSX('header')}
          {renderBlank()}
          {renderTNodeJSX('headerRightContent')}
          {expandIcon.value && expandIconPlacement.value === 'right' ? renderIcon(expandIconPlacement.value) : null}
        </div>
      );
    };
    const renderBodyByNormal = () => {
      return (
        <div v-show={isActive.value} class={`${componentName.value}__body`}>
          <div class={`${componentName.value}__content`}>{renderTNodeJSX('default')}</div>
        </div>
      );
    };
    const renderBodyDestroyOnCollapse = () => {
      return isActive.value ? (
        <div class={`${componentName.value}__body`}>
          <div class={`${componentName.value}__content`}>{renderTNodeJSX('default')}</div>
        </div>
      ) : null;
    };
    const renderBody = () => {
      return destroyOnCollapse.value ? renderBodyDestroyOnCollapse() : renderBodyByNormal();
    };
    return () => {
      return (
        <div class={classes.value}>
          <div class={`${componentName.value}__wrapper`}>
            {renderHeader()}
            <Transition
              name={transitionClass.value}
              onBeforeEnter={beforeEnter}
              onEnter={enter}
              onAfterEnter={afterEnter}
              onBeforeLeave={beforeLeave}
              onLeave={leave}
              onAfterLeave={afterLeave}
            >
              {renderBody()}
            </Transition>
          </div>
        </div>
      );
    };
  },
});
