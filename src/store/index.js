// Type import removed for JavaScript conversion
import { createPinia } from 'pinia';
import { jsonClone } from '@sa/utils';
import { SetupStoreId } from '@/enum';

function resetSetupStore(context) {
  const setupSyntaxIds = Object.values(SetupStoreId);
  if (setupSyntaxIds.includes(context.store.$id)) {
    const { $state } = context.store;
    const defaultStore = jsonClone($state);
    context.store.$reset = () => {
      context.store.$patch(defaultStore);
    };
  }
}

/** Setup Vue store plugin pinia */
export function setupStore(app) {
  const store = createPinia();
  store.use(resetSetupStore);

  app.use(store);
}
