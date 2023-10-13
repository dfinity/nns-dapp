export type Action = FavoriteAction | OpenSendModalAction;

export enum ActionTypes {
  TOGGLE_FAVORITE = "TOGGLE_FAVORITE",
  OPEN_SEND_MODAL = "OPEN_SEND_MODAL",
}

type BaseAction = {
  type: ActionTypes;
};

type FavoriteAction = BaseAction & {
  type: ActionTypes.TOGGLE_FAVORITE;
  id: string;
};

type OpenSendModalAction = BaseAction & {
  type: ActionTypes.OPEN_SEND_MODAL;
  id: string;
  fromAccount: string;
};

export const createFavoriteAction = ({
  id,
}: {
  id: string;
}): FavoriteAction => ({
  type: ActionTypes.TOGGLE_FAVORITE,
  id,
});

export const createOpenModalAction = ({
  id,
  fromAccount,
}: {
  id: string;
  fromAccount: string;
}): OpenSendModalAction => ({
  type: ActionTypes.OPEN_SEND_MODAL,
  id,
  fromAccount,
});
