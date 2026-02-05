import * as bootstrap from 'bootstrap';

export default {
  mounted(el, binding) {
    const options = {
      title: binding.value,
      placement: el.dataset.bsPlacement || 'top',
      trigger: 'hover',
    };
    new bootstrap.Tooltip(el, options);
  },
  updated(el, binding) {
    const instance = bootstrap.Tooltip.getInstance(el);
    if (instance) {
      instance.setContent({ '.tooltip-inner': binding.value });
    }
  },
  unmounted(el) {
    const instance = bootstrap.Tooltip.getInstance(el);
    if (instance) {
      instance.dispose();
    }
  },
};
