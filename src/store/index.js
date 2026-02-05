import { createStore } from "vuex";

const store = createStore({
  state: {
    globalVariables: {},
  },
  mutations: {
    setGlobalVariable(state, { key, value }) {
      state.globalVariables[key] = value;
    },
    removeGlobalVariable(state, key) {
      delete state.globalVariables[key];
    },
  },
  actions: {
    updateGlobalVariable({ commit }, { key, value }) {
      commit("setGlobalVariable", { key, value });
    },
    deleteGlobalVariable({ commit }, key) {
      commit("removeGlobalVariable", key);
    },
  },
  getters: {
    getGlobalVariable: (state) => (key) => {
      return state.globalVariables[key];
    },
    getAllGlobalVariables: (state) => {
      return state.globalVariables;
    },
  },
});

export default store;
