export const menuButton = {
  main: {
    categories: {
      data: "main/categories",
      label: "Список категориий для поиска",
      role: ["admin", "moderator", "user"],
    },
    system: {
      data: "main/system",
      label: "Система",
      role: ["admin", "moderator"],
    },
    // subscribe: {
    //   data: "main/subscribe",
    //   label: "Настройки подписки",
    //   role: ["admin", "moderator"],
    // },
  },
  browser: {
    back: { data: "browser/back", label: "Назад" },
    toggle: { data: "browser/toggle" },
  },
  roleUsers: {
    changeRoleEnd: { data: "roleUsers/changeRoleEnd" },
    changeRole: { label: "Поменять роль", data: "roleUsers/changeRole" },
    user: { data: "roleUsers/user" },
    back: { data: "roleUsers/back", label: "Назад" },
  },
  system: {
    settingsBrowser: {
      data: "system/browser",
      label: "Настройки браузера",
      role: ["Admin"],
    },
    settingsRoleUser: {
      data: "system/roleUsers",
      label: "Настройки роли пользователя",
    },
    back: { data: "system/back", label: "Назад" },
  },
  subscribe: {
    create: { data: "subscribe/create", label: "Создать подписку" },
    list: { data: "subscribe/list", label: "Список подписок" },
    back: { data: "subscribe/back", label: "Назад" },
  },
  categories: {
    add: { data: "categories/add", label: "Добавить категорию" },
    list: { data: "categories/list", label: "Список ваших категорий" },
    sharedList: {
      data: "categories/sharedList",
      label: "Совместный список категорий",
    },
    back: { data: "categories/back", label: "Назад" },
  },
  shared: {
    back: { data: "shared/back", label: "Назад" },
  },
  sharedDetail: {
    create: {
      data: "sharedDetail/create",
      label: "Создать ссылку на приглашение",
    },
    back: { data: "sharedDetail/back", label: "Назад" },
  },
  detailList: {
    shared: { data: "detailList/shared", label: "Поделиться / Общий доступ" },
    // edit: { data: "detailList/edit", label: "Редактировать категорию" },
    editCron: {
      data: "detailList/editCron",
      label: "Изменить время запуска",
    },
    editUrl: { data: "detailList/editUrl", label: "Изменить ссылку" },
    delete: { data: "detailList/delete", label: "Удалить категорию" },
    back: { data: "detailList/back", label: "Назад" },
  },
  editCron: {
    back: { data: "editCron/back", label: "Назад" },
  },
  editUrl: {
    back: { data: "editUrl/back", label: "Назад" },
  },
  detailShared: {
    unsubcribe: { data: "detailShared/unsubcribe", label: "Отписаться" },
    back: { data: "detailShared/back", label: "Назад" },
  },
  categoriesSharedList: {
    detail: { data: "detailShared/detail" },
    back: { data: "categoriesSharedList/back", label: "Назад" },
  },
  categoriesAdd: {
    back: { data: "categories/add/back", label: "Назад" },
  },
  categoriesList: {
    detail: { data: "detailList/detail" },
    back: { data: "categoriesList/back", label: "Назад" },
  },
};
