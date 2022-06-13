declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

export type ArrayItem<T extends any[]> = T extends (infer Titem)[] ? Titem : never;
export type ResolvedType<T> = T extends Promise<infer R> ? R : T;
export type GeneratorType<T extends (...args: any) => any> = ResolvedType<ReturnType<T>>;

export type Config = {
  /** APIの設定 */
  api: {
    /** item.jsonのURL */
    itemInfo: string;
    categoryInfo: string;
  };
};

// https://cdnprimagiimg01.blob.core.windows.net/primagi/assets/data/item.json

interface Item {
  /**
   * カードID
   * https://cdn.primagi.jp/assets/images/item/P01/{カードID}.png
   */
  id: number;
  /**
   * コーデ名
   * @example "おとめマーガレット"
   */
  coordinationName: string;
  /**
   * モデル名
   * @example "SPCW20002_T01A"
   */
  modelName: string;
  /**
   * ブランド
   * - 1: LOVELY MELODY
   * - 2: VIVID STAR
   * - 3: Radiant Abyss
   * - 4: Eternal Revue
   * - 5: ELECTRO REMIX
   * - 7: SHINING DIVA
   * - 8: Prism Stone
   *
   * https://cdn.primagi.jp/assets/images/item/common/ico_props_brand_{ブランド}_pc.png
   * https://cdn.primagi.jp/assets/images/item/common/ico_props_brand_{ブランド}_sp.png
   */
  brand: number;
  /**
   * - 1: カジュアル
   * - 2: スタイリッシュ
   * - 3: ライブ
   */
  genre: number;
  /**
   * - 1: ちゃ
   * - 2: あか
   * - 3: ピンク
   * - 4: オレンジ
   * - 5: きいろ
   * - 6: みどり
   * - 7: みずいろ
   * - 8: あお
   * - 9: むらさき
   * - 10: くろ
   * - 11: しろ
   * - 12: シルバー
   * - 13: ゴールド
   *
   * https://cdn.primagi.jp/assets/images/item/common/ico_props_genre_color_{genre}_{color}_sp.png
   */
  color: number;
  /**
   * レアリティ
   * - 1: R
   * - 2: SR
   * - 3: UR
   */
  rarity: number;
  /**
   * ワッチャ
   * @example "600"
   */
  watcha: string;
  /**
   * 部位
   * - 1: トップス
   * - 2: ワンピース
   * - 3: スカート
   * - 4: シューズ
   * - 5: アクセ
   */
  category: number;
  /**
   * テイスト
   * - 2: フラワー
   * - 3: スター
   * - 4: ハート
   * - 5: ガーリー
   * - 6: キュート
   * - 7: チェック
   * - 8: リボン
   * - 9: クール
   * - 10: ゴシック
   * - 11: ジュエル
   * - 12: スポーティ
   * - 13: ダンス
   * - 14: ポップ
   * - 15: ミステリアス
   * - 16: リボン
   * - 17: スイーツ
   * - 18: ベーシック
   *
   * https://cdn.primagi.jp/assets/images/item/common/ico_props_subCategory_{テイスト}_pc.png
   */
  subCategory: number;
  /**
   * カードID
   * @example "PM1-001"
   */
  sealId: string;
  /**
   * - "1": 1章
   * - "2": プロモ
   */
  collection: string;
  /**
   * @example "0"
   */
  release: string;
  /**
   * @example "0"
   */
  icon: string;
  /**
   * 種別
   * トップス、ワンピ以外は空文字
   * @example "章コーデ"
   */
  kinds: string;
  /**
   * コーデID
   * https://cdn.primagi.jp/assets/images/item/P01/img_codination_{コーデID}_main.jpg
   */
  directoryNumber: number;
  isShow: true;
  hasMainImage: true;
  /**
   * 期間
   * トップス、ワンピ以外は空文字
   * @example "2021.10.01 ~"
   * @example "2021年12月2日（木）〜2022年2月2日（水）"
   */
  span: string;
  isShowItem: true;
  order: number | null;
  /** @example P01 */
  chapter: string;

  rarityStr: string;
  brandImg: string;
  cardImg: string;
  coordinateImg: string;
  genreColorImg: string;
  rarityImg: string;
  subCategoryImg: string;
  /** 検索用にいろいろ突っ込んだ値 */
  freeWord: string;
}
type ItemList = Item[];

interface FilterInfo {
  /** レアリティ */
  rarity: {
    id: number;
    name: string;
  }[];
  /** 部位 */
  category: {
    id: number;
    name: string;
  }[];
  /** 色 */
  color: {
    id: number;
    name: string;
    fontColor: string;
    backgroundColor: string;
    strokeColor: string;
  }[];
  /** ジャンル */
  genre: {
    id: number;
    name: string;
  }[];
  /** テイスト */
  subCategory: {
    id: number;
    name: string;
  }[];
  /** ブランド */
  brand: {
    id: number;
    name: string;
  }[];
}

interface DispFilterInfo {
  [id: number]: boolean;
}
