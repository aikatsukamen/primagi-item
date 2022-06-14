import React from 'react';
import Modal from 'react-modal';
import { Item, ItemList, Config, FilterInfo, DispFilterInfo } from '../../../types/global';
import { categoryToTxt, useDelayedEffect } from '../../../common/util';
import useCollapse from 'react-collapsed';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const appver = '0.1';

/** Jsonファイルを取得 */
async function fetchJson<T>(url: string): Promise<T> {
  const result = await fetch(url);
  const json = await result.json();
  return json as T;
}

const swingModalStyles: Modal.Styles = {
  overlay: {
    zIndex: 2,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    // height: '70vh',
    background: 'linear-gradient(90deg, #fe8ae1 0%, #d79fea 23%, #aabeff 80%, #87cfed 100%)',
    padding: '10px',
    maxWidth: '500px',
    // height: 'calc(100vh - 100px)',
    maxHeight: '565px',
    zIndex: 3,
  },
};

const initialItem: Item = {
  brand: 0,
  brandImg: '',
  cardImg: '',
  category: 0,
  collection: '',
  color: 0,
  coordinateImg: '',
  coordinationName: '',
  directoryNumber: 0,
  genre: 0,
  genreColorImg: '',
  hasMainImage: true,
  icon: '',
  id: 0,
  isShow: true,
  isShowItem: true,
  kinds: '',
  modelName: '',
  rarity: 0,
  rarityImg: '',
  release: '',
  sealId: '',
  span: '',
  subCategory: 0,
  subCategoryImg: '',
  watcha: '',
  rarityStr: '',
  order: null,
  chapter: '',
  freeWord: '',
};

const App: React.FC = () => {
  // どっかから取ってくるデータ
  const [config, setConfig] = React.useState<Config>();
  const [cardList, setCardList] = React.useState<ItemList>([]);
  const [versionList, setVersionList] = React.useState<string[]>(['P01']);

  // 表示中のカードリスト
  const [dispCardList, setDispCardList] = React.useState<ItemList>([]);

  // フィルター情報
  const [filterInfo, setFilterInfo] = React.useState<FilterInfo>({ rarity: [], category: [], color: [], genre: [], subCategory: [], brand: [] });
  const [rarityFilter, setRarityFilter] = React.useState<DispFilterInfo>({});
  const [colorFilter, setColorFilter] = React.useState<DispFilterInfo>({});
  const [genreFilter, setGenreFilter] = React.useState<DispFilterInfo>({});
  const [subCategoryFilter, setSubCategoryFilter] = React.useState<DispFilterInfo>({});
  const [brandFilter, setBrandFilter] = React.useState<DispFilterInfo>({});
  const changeRarityFilter = (id: number) => () => {
    const newFilter = JSON.parse(JSON.stringify(rarityFilter));
    newFilter[id] = !newFilter[id];
    setRarityFilter(newFilter);
  };
  const changeColorFilter = (id: number) => () => {
    const newFilter = JSON.parse(JSON.stringify(colorFilter));
    newFilter[id] = !newFilter[id];
    setColorFilter(newFilter);
  };
  const changeGenreFilter = (id: number) => () => {
    const newFilter = JSON.parse(JSON.stringify(genreFilter));
    newFilter[id] = !newFilter[id];
    setGenreFilter(newFilter);
  };
  const changeSubCategoryFilter = (id: number) => () => {
    const newFilter = JSON.parse(JSON.stringify(subCategoryFilter));
    newFilter[id] = !newFilter[id];
    setSubCategoryFilter(newFilter);
  };
  const changeBrandFilter = (id: number) => () => {
    const newFilter = JSON.parse(JSON.stringify(brandFilter));
    newFilter[id] = !newFilter[id];
    setBrandFilter(newFilter);
  };

  const resetAllFilter = (filterInfo: FilterInfo) => {
    const rarityFilter: DispFilterInfo = {};
    filterInfo.rarity.map((item) => (rarityFilter[item.id] = true));
    setRarityFilter(rarityFilter);

    const colorFilter: DispFilterInfo = {};
    filterInfo.color.map((item) => (colorFilter[item.id] = true));
    setColorFilter(colorFilter);

    const genreFilter: DispFilterInfo = {};
    filterInfo.genre.map((item) => (genreFilter[item.id] = true));
    setGenreFilter(genreFilter);

    const subCategoryFilter: DispFilterInfo = {};
    filterInfo.subCategory.map((item) => (subCategoryFilter[item.id] = true));
    setSubCategoryFilter(subCategoryFilter);

    const brandFilter: DispFilterInfo = {};
    filterInfo.brand.map((item) => (brandFilter[item.id] = true));
    setBrandFilter(brandFilter);
  };

  // スクリプトの中で読み書きするデータ
  // モーダル表示状態
  const [swingModalIsOpen, setSwingModalIsOpen] = React.useState(false);
  const [coordinateModalIsOpen, setCoordinateModalIsOpen] = React.useState(false);

  // モーダルで表示しているカード
  const [openCard, setOpenCard] = React.useState<Item>(initialItem);

  // リストに表示するバージョン
  const [versionId, setVersionId] = React.useState<'P01' | 'P02' | '全アイテム'>('P01');
  const selectVersionId = (event: React.ChangeEvent<{ name?: string | undefined; value: string }>) => {
    setVersionId(event.target.value as any);

    // モーダルを開いてたら閉じる
    closeModal();
  };

  // 印刷リスト
  const [coordiList, setCoordiList] = React.useState<{ tops: Item | null; topBottoms: Item | null; bottoms: Item | null; shoes: Item | null; accessory: Item | null }>({
    tops: null,
    topBottoms: null,
    bottoms: null,
    shoes: null,
    accessory: null,
  });
  const addCoordiList = (card: Item) => () => {
    switch (card.category) {
      case 1: {
        setCoordiList({ ...coordiList, tops: card, topBottoms: null });
        break;
      }
      case 2: {
        setCoordiList({ ...coordiList, tops: null, topBottoms: card, bottoms: null });
        break;
      }
      case 3: {
        setCoordiList({ ...coordiList, topBottoms: null, bottoms: card });
        break;
      }
      case 4: {
        setCoordiList({ ...coordiList, shoes: card });
        break;
      }
      case 5: {
        setCoordiList({ ...coordiList, accessory: card });
        break;
      }
    }
    closeModal();
  };
  const delCoordiList = (card: Item) => () => {
    switch (card.category) {
      case 1: {
        setCoordiList({ ...coordiList, tops: null });
        break;
      }
      case 2: {
        setCoordiList({ ...coordiList, topBottoms: null });
        break;
      }
      case 3: {
        setCoordiList({ ...coordiList, bottoms: null });
        break;
      }
      case 4: {
        setCoordiList({ ...coordiList, shoes: null });
        break;
      }
      case 5: {
        setCoordiList({ ...coordiList, accessory: null });
        break;
      }
    }
  };

  const [searchWord, setSearchWord] = React.useState<string>('');
  const changeSearchWord: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchWord(e.target.value);
  };

  const [isExpanded, setExpanded] = React.useState(false);
  const { getCollapseProps, getToggleProps } = useCollapse({ isExpanded });

  // 部位フィルタ
  const [categoryFilter, setCategoryFilter] = React.useState({ tops: true, bottoms: true, tb: true, shoes: true, accessory: true });
  const changeCategoryFilter = (category: keyof typeof categoryFilter) => () => {
    const newFilter: typeof categoryFilter = JSON.parse(JSON.stringify(categoryFilter));
    newFilter[category] = !newFilter[category];
    setCategoryFilter(newFilter);
  };

  /** カード情報を取得 */
  const fetchCardList = async () => {
    const time = new Date().getTime();

    const file = `./config.json?t=${time}`;
    const config = await fetchJson<Config>(file);
    setConfig(config);

    const cardlist: ItemList = [];
    let filterInfo: FilterInfo = { rarity: [], category: [], color: [], genre: [], subCategory: [], brand: [] };

    // データ取得
    try {
      const list: ItemList = await fetchJson(`${config.api.itemInfo}?t=${time}`);
      list.map((item) => {
        cardlist.push(item);
      });

      filterInfo = await fetchJson(`${config.api.categoryInfo}?t=${time}`);
    } catch (e) {
      console.error(e);
    }

    return { cardlist, filterInfo };
  };

  // 初期処理
  React.useEffect(() => {
    fetchCardList()
      .then((data) => {
        console.log(`item size = ${data.cardlist.length}`);
        setCardList(data.cardlist);
        setFilterInfo(data.filterInfo);

        // 弾リスト
        const versions: string[] = [];
        data.cardlist.map((item) => {
          if (!versions.includes(item.chapter)) versions.push(item.chapter);
        });
        versions.push('全アイテム');
        setVersionList(versions);
        setDispCardList(data.cardlist.filter((item) => item.chapter === versions[0]));

        // フィルター情報初期化
        resetAllFilter(data.filterInfo);
      })
      .then(() => {
        // カテゴリ情報
      })
      .catch(() => {
        alert('データ取得に失敗しました');
      });
  }, []);

  useDelayedEffect(
    () => {
      // バージョン、ワード検索
      let newList = cardList
        .filter((card) => versionId === '全アイテム' || card.chapter === versionId)
        .filter((card) => (card.freeWord ? card.freeWord.toLowerCase().includes(searchWord.toLowerCase()) : card.coordinationName.includes(searchWord)));

      // カテゴリ
      if (!categoryFilter.tops) newList = newList.filter((item) => item.category !== 1);
      if (!categoryFilter.tb) newList = newList.filter((item) => item.category !== 2);
      if (!categoryFilter.bottoms) newList = newList.filter((item) => item.category !== 3);
      if (!categoryFilter.shoes) newList = newList.filter((item) => item.category !== 4);
      if (!categoryFilter.accessory) newList = newList.filter((item) => item.category !== 5);

      // レア
      filterInfo.rarity.map((rarity) => {
        if (!rarityFilter[rarity.id]) newList = newList.filter((item) => item.rarity !== rarity.id);
      });
      filterInfo.color.map((color) => {
        if (!colorFilter[color.id]) newList = newList.filter((item) => item.color !== color.id);
      });
      filterInfo.genre.map((genre) => {
        if (!genreFilter[genre.id]) newList = newList.filter((item) => item.genre !== genre.id);
      });
      filterInfo.subCategory.map((subCategory) => {
        if (!subCategoryFilter[subCategory.id]) newList = newList.filter((item) => item.subCategory !== subCategory.id);
      });
      filterInfo.brand.map((brand) => {
        if (!brandFilter[brand.id]) newList = newList.filter((item) => item.brand !== brand.id);
      });

      setDispCardList(newList);
    },
    [
      searchWord,
      versionId,
      JSON.stringify(rarityFilter),
      JSON.stringify(colorFilter),
      JSON.stringify(genreFilter),
      JSON.stringify(categoryFilter),
      JSON.stringify(subCategoryFilter),
      JSON.stringify(brandFilter),
    ],
    200,
  );

  const clickCard = (card: Item) => () => {
    setOpenCard(card);
    setSwingModalIsOpen(true);
  };

  const clickCoordiButton = async () => {
    setCoordinateModalIsOpen(true);
  };

  const closeModal = () => {
    setSwingModalIsOpen(false);
    setCoordinateModalIsOpen(false);
  };

  /** カード一枚分のDom作る */
  const createListItem = (card: Item, key: string) => {
    const frontImgUrl = card.cardImg;

    return (
      <button key={key} onClick={clickCard(card)}>
        <div style={{ transform: 'translate(-50%, 0)', left: '50%', position: 'relative' }}>
          <img
            src={frontImgUrl}
            width={80}
            height={80}
            loading={'lazy'}
            onError={(e) => {
              e.currentTarget.src = 'img/img_load_err.jpg';
              e.currentTarget.removeAttribute('onerror');
              e.currentTarget.removeAttribute('onload');
            }}
            onLoad={(e) => {
              e.currentTarget.removeAttribute('onerror');
              e.currentTarget.removeAttribute('onload');
            }}
          />
          <div className={'cardtitleButton'}>
            <div className={'cardtitleButtonInnter'}>{`${card.sealId} ${card.rarityStr}`}</div>
          </div>
        </div>
      </button>
    );
  };

  const createSwing = (card: Item, thumbnail: string, background: string, backgroundRotate: boolean, key: string) => {
    return (
      <button className={'imageFrame'} onClick={addCoordiList(card)}>
        <span className={'imageFrameTop'}></span>
        <span className={'imageFrameBottom'} />
        <div key={key} className={'swingitem'}>
          <button>
            <img
              src={thumbnail}
              width={80}
              onError={(e) => {
                e.currentTarget.src = 'img/img_load_err.jpg';
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
              onLoad={(e) => {
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
            />
          </button>
        </div>
      </button>
    );
  };

  const createCoordinate = () => {
    return (
      <div style={{ textAlign: 'center' }}>
        {coordiList.accessory ? (
          <div style={{ marginBottom: -15, marginLeft: 30 }}>
            <img
              src={coordiList.accessory.cardImg}
              width={80}
              onError={(e) => {
                e.currentTarget.src = 'img/img_load_err.jpg';
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
              onLoad={(e) => {
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
            />
          </div>
        ) : (
          ''
        )}
        {coordiList.topBottoms ? (
          <div style={{ marginBottom: -60 }}>
            <img
              src={coordiList.topBottoms.cardImg}
              width={150}
              onError={(e) => {
                e.currentTarget.src = 'img/img_load_err.jpg';
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
              onLoad={(e) => {
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
            />
          </div>
        ) : (
          ''
        )}
        {coordiList.tops ? (
          <div style={{ marginBottom: -80 }}>
            <img
              src={coordiList.tops.cardImg}
              width={150}
              onError={(e) => {
                e.currentTarget.src = 'img/img_load_err.jpg';
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
              onLoad={(e) => {
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
            />
          </div>
        ) : (
          ''
        )}
        {coordiList.bottoms ? (
          <div style={{ marginBottom: -60 }}>
            <img
              src={coordiList.bottoms.cardImg}
              width={150}
              onError={(e) => {
                e.currentTarget.src = 'img/img_load_err.jpg';
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
              onLoad={(e) => {
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
            />
          </div>
        ) : (
          ''
        )}
        {coordiList.shoes ? (
          <div style={{ marginTop: 30 }}>
            <img
              src={coordiList.shoes.cardImg}
              width={150}
              onError={(e) => {
                e.currentTarget.src = 'img/img_load_err.jpg';
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
              onLoad={(e) => {
                e.currentTarget.removeAttribute('onerror');
                e.currentTarget.removeAttribute('onload');
              }}
            />
          </div>
        ) : (
          ''
        )}
      </div>
    );
  };

  /** 下のコーデ対象一覧へ追加 */
  const createCoordiItem = (card: Item | null) => {
    if (!card) return '';
    return (
      <div className={'coordiItem'} key={`item_${card.sealId}`} onClick={delCoordiList(card)}>
        <button>
          <div>
            <img src={card.cardImg} width={40} />
          </div>
          <div style={{ marginTop: '-1.5em', fontWeight: 'bold', fontSize: 'small' }}>
            <span>{card.sealId}</span>
          </div>
        </button>
      </div>
    );
  };

  const createCategoryFilter = () => {
    return (
      <>
        {/* 部位 */}
        <div className="filterLine">
          <div className={'title'}>部位</div>
          <div style={{ width: '100%' }}>
            <button onClick={changeCategoryFilter('tops')}>
              <img className={'categoryIcon '} style={{ filter: categoryFilter.tops ? '' : 'grayscale(100%)' }} src="img/icon-tops.jpg" width={30} />
            </button>
            <button onClick={changeCategoryFilter('tb')}>
              <img className={'categoryIcon '} style={{ filter: categoryFilter.tb ? '' : 'grayscale(100%)' }} src="img/icon-tb.jpg" width={30} />
            </button>
            <button onClick={changeCategoryFilter('bottoms')}>
              <img className={'categoryIcon '} style={{ filter: categoryFilter.bottoms ? '' : 'grayscale(100%)' }} src="img/icon-bottoms.jpg" width={30} />
            </button>
            <button onClick={changeCategoryFilter('shoes')}>
              <img className={'categoryIcon '} style={{ filter: categoryFilter.shoes ? '' : 'grayscale(100%)' }} src="img/icon-shoes.jpg" width={30} />
            </button>
            <button onClick={changeCategoryFilter('accessory')}>
              <img className={'categoryIcon '} style={{ filter: categoryFilter.accessory ? '' : 'grayscale(100%)' }} src="img/icon-accessory.jpg" width={30} />
            </button>
          </div>
        </div>
        {/* レア */}
        <div className="filterLine">
          <div className={'title'}>レア</div>
          <div style={{ width: '100%' }}>
            {filterInfo.rarity.map((item, index) => {
              return (
                <button onClick={changeRarityFilter(item.id)} key={`rarity_${index}`}>
                  <img
                    className={'categoryIcon '}
                    style={{ filter: rarityFilter[item.id] ? '' : 'grayscale(100%)' }}
                    src={`https://cdn.primagi.jp/assets/images/mypage/item/rarity/${item.id}.png`}
                    width={30}
                  />
                </button>
              );
            })}
          </div>
        </div>
        {/* 色 */}
        <div className="filterLine">
          <div className={'title'}>色</div>
          <div style={{ width: '100%' }}>
            {filterInfo.color.map((item, index) => {
              return (
                <button onClick={changeColorFilter(item.id)} key={`color_${index}`}>
                  <span
                    className="circle filterColorText"
                    style={{
                      backgroundColor: colorFilter[item.id] ? item.backgroundColor : 'gray',
                      color: item.fontColor,
                      textShadow: `1px 1px 0 ${item.strokeColor},-1px 1px 0 ${item.strokeColor},1px -1px 0 ${item.strokeColor},-1px -1px 0 ${item.strokeColor}`,
                    }}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="filterLine">
          <div className={'title'}>ジャンル</div>
          <div style={{ width: '100%' }}>
            {filterInfo.genre.map((item, index) => {
              return (
                <button onClick={changeGenreFilter(item.id)} key={`genre_${index}`}>
                  <img
                    className={'categoryIcon '}
                    style={{ filter: genreFilter[item.id] ? '' : 'grayscale(100%)' }}
                    src={`https://cdn.primagi.jp/assets/images/item/common/ico_props_genre_color_${item.id}_2_sp.png`}
                    width={30}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="filterLine">
          <div className={'title'}>テイスト</div>
          <div style={{ width: '100%' }}>
            {filterInfo.subCategory.map((item, index) => {
              return (
                <button onClick={changeSubCategoryFilter(item.id)} key={`subCategory_${index}`}>
                  <img
                    className={'categoryIcon '}
                    style={{ filter: subCategoryFilter[item.id] ? '' : 'grayscale(100%)' }}
                    src={`https://cdn.primagi.jp/assets/images/item/common/ico_props_subCategory_${item.id}_sp.png`}
                    width={30}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div className="filterLine">
          <div className={'title'}>ブランド</div>
          <div style={{ width: '100%' }}>
            {filterInfo.brand.map((item, index) => {
              return (
                <button onClick={changeBrandFilter(item.id)} key={`brand_${index}`}>
                  <img
                    className={'categoryIcon '}
                    style={{ filter: brandFilter[item.id] ? '' : 'grayscale(100%)' }}
                    src={`https://cdn.primagi.jp/assets/images/mypage/item/brand/${item.id}.png`}
                    width={40}
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <button className="filterResetButton" onClick={() => resetAllFilter(filterInfo)}>
            フィルタをリセット
          </button>
        </div>
      </>
    );
  };

  return (
    <div>
      <div className={'SW-update-dialog'} />
      <ToastContainer style={{ wordBreak: 'break-word' }} />
      {/* ヘッダ */}
      <div className={'header'}>
        <div className={'header-inner'}>
          <div>
            <div className={'select'}>
              <div className={'appver'}>
                <span>ver.{appver}</span>
              </div>

              {/* 弾選択 */}
              <span className={'title'} style={{ width: 70 }}>
                章
              </span>
              <select style={{ width: 140 }} onChange={selectVersionId}>
                {versionList.map((versionId) => {
                  return (
                    <option key={`verselect_${versionId}`} value={versionId}>
                      {versionId}
                    </option>
                  );
                })}
              </select>

              {/* ワード検索 */}
              <div style={{ marginTop: 2 }}>
                <span className={'title'} style={{ width: 70 }}>
                  検索
                </span>
                <input type={'text'} style={{ width: 140 }} onChange={changeSearchWord} value={searchWord} />
              </div>

              {/* フィルタ */}
              <div>
                <button
                  style={{ paddingLeft: 0 }}
                  className={'title'}
                  {...getToggleProps({
                    onClick: () => setExpanded((prevExpanded) => !prevExpanded),
                  })}
                >
                  {isExpanded ? '▼フィルタ' : '▼フィルタ'}
                </button>
                <div {...getCollapseProps()}>
                  <div style={{ overflowY: 'auto' }}>{createCategoryFilter()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={'content'}>{dispCardList.map((card, index) => createListItem(card, `item_${card.sealId}_${index}`))}</div>

      {/* フッタ */}
      <div style={{ height: 200 }} />
      <div className={'footer'}>
        <div className={'footer-inner'}>
          <div className={'coordiItemList'}>
            {/* 印刷用リスト */}
            {(coordiList.tops || coordiList.topBottoms || coordiList.bottoms || coordiList.shoes || coordiList.accessory) && (
              <button className={'exportCoordiButton'} onClick={clickCoordiButton}>
                コーデ表示
              </button>
            )}
            {createCoordiItem(coordiList.tops)}
            {createCoordiItem(coordiList.topBottoms)}
            {createCoordiItem(coordiList.bottoms)}
            {createCoordiItem(coordiList.shoes)}
            {createCoordiItem(coordiList.accessory)}
          </div>
        </div>
      </div>

      {/* カード選択時のモーダル */}
      <Modal isOpen={swingModalIsOpen} style={swingModalStyles} onRequestClose={closeModal} shouldCloseOnOverlayClick={true} ariaHideApp={false}>
        <div className={'modalInner'} style={{ backgroundImage: `url(${openCard.coordinateImg})`, backgroundSize: 'cover' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
            <div style={{ float: 'right' }}>
              <button className={'closeButton'} onClick={closeModal}>
                x
              </button>
            </div>
            <div>
              {/* タイトル */}
              <div>
                <div className={'title coordiListTitle'}>{`${openCard.coordinationName}`}</div>
              </div>
              {/* カード画像 */}
              <div className={'swingcontent'}>{createSwing(openCard, openCard.cardImg, './img/card.png', false, 'swing_0')}</div>
              {/* カード詳細 */}
              <div>
                <div>
                  <div style={{ textAlign: 'center', fontSize: 'small' }}>{openCard.span}</div>
                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{openCard.sealId}</div>
                </div>
                <div className={'itemModal_props'}>
                  <div className={'itemModal_props_name'}>カテゴリ</div>
                  <div className={'itemModal_props_value'}>
                    <span style={{ width: 150, display: 'inline-block', textAlign: 'right' }}>{categoryToTxt(openCard.category)} </span>
                  </div>
                </div>
                <div className={'itemModal_props'}>
                  <div className={'itemModal_props_name'}>レアリティ</div>
                  <div className={'itemModal_props_value'}>
                    <img src={openCard.rarityImg} width={40} />
                  </div>
                </div>
                <div className={'itemModal_props'}>
                  <div className={'itemModal_props_name'}>ワッチャ</div>
                  <div className={'itemModal_props_value'}>
                    <span style={{ width: 40, display: 'inline-block', textAlign: 'center' }}>{openCard.watcha} </span>
                  </div>
                </div>
                <div className={'itemModal_props'}>
                  <div className={'itemModal_props_name'}>ブランド</div>
                  <div className={'itemModal_props_value'}>
                    <img src={openCard.brandImg} width={40} />
                  </div>
                </div>
                <div className={'itemModal_props'}>
                  <div className={'itemModal_props_name'}>ジャンル/カラー</div>
                  <div className={'itemModal_props_value'}>
                    <img src={openCard.genreColorImg} width={40} />
                  </div>
                </div>
                <div className={'itemModal_props'}>
                  <div className={'itemModal_props_name'}>テイスト</div>
                  <div className={'itemModal_props_value'}>
                    <img src={openCard.subCategoryImg} width={40} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* コーデプレビュー */}
      <Modal isOpen={coordinateModalIsOpen} style={swingModalStyles} onRequestClose={closeModal} shouldCloseOnOverlayClick={true} ariaHideApp={false}>
        <div className={'modalInner'}>
          <div>
            <div style={{ float: 'right' }}>
              <button className={'closeButton'} onClick={closeModal}>
                x
              </button>
            </div>
            <div>
              {/* カード画像 */}
              <div>{createCoordinate()}</div>
              {/* カード詳細 */}
              <div>
                {coordiList.accessory && <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{`${coordiList.accessory.sealId} ${coordiList.accessory.coordinationName}`}</div>}
                {coordiList.topBottoms && (
                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{`${coordiList.topBottoms.sealId} ${coordiList.topBottoms.coordinationName}`}</div>
                )}
                {coordiList.tops && <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{`${coordiList.tops.sealId} ${coordiList.tops.coordinationName}`}</div>}
                {coordiList.bottoms && <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{`${coordiList.bottoms.sealId} ${coordiList.bottoms.coordinationName}`}</div>}
                {coordiList.shoes && <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{`${coordiList.shoes.sealId} ${coordiList.shoes.coordinationName}`}</div>}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
