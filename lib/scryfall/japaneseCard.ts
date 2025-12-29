import { Card } from '@/types/card';

const SCRYFALL_API_BASE = 'https://api.scryfall.com';
const RATE_LIMIT_DELAY = 100;

let lastRequestTime = 0;

/**
 * レート制限を考慮してリクエストを実行
 */
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
  return fetch(url);
}

/**
 * カードの日本語版を検索
 * Oracle IDを使って同じカードの全印刷版を取得し、日本語版を探す
 */
export async function findJapaneseVersion(card: Card): Promise<Card | null> {
  if (!card.oracle_id) {
    console.log(`[findJapaneseVersion] No oracle_id for card: ${card.name}`);
    return null;
  }

  try {
    // Oracle IDで検索して、日本語版をフィルタ
    const url = `${SCRYFALL_API_BASE}/cards/search?q=oracleid:${card.oracle_id}+lang:ja&unique=prints`;
    console.log(`[findJapaneseVersion] Searching for Japanese version of ${card.name}...`);

    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      console.log(`[findJapaneseVersion] No Japanese version found for ${card.name} (status: ${response.status})`);
      return null;
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      console.log(`[findJapaneseVersion] Found ${data.data.length} Japanese version(s) for ${card.name}`);

      // 複数の印刷版がある場合、日本語名が存在する版を優先的に選択
      let japaneseCard = data.data[0];

      for (const cardVersion of data.data) {
        // 両面カードの場合、card_facesをチェック
        if (cardVersion.card_faces && cardVersion.card_faces.length > 0) {
          const hasJapaneseName = cardVersion.card_faces.some(
            (face: any) => face.printed_name && face.printed_name !== face.name
          );
          if (hasJapaneseName) {
            japaneseCard = cardVersion;
            console.log(`[findJapaneseVersion] Selected version with Japanese names in card_faces`);
            break;
          }
        }
        // 通常のカードの場合、printed_nameをチェック
        else if (cardVersion.printed_name && cardVersion.printed_name !== cardVersion.name) {
          japaneseCard = cardVersion;
          console.log(`[findJapaneseVersion] Selected version with Japanese printed_name`);
          break;
        }
      }

      // デバッグ: APIレスポンスの内容を確認
      console.log(`[findJapaneseVersion] Selected card:`, {
        name: japaneseCard.name,
        printed_name: japaneseCard.printed_name,
        lang: japaneseCard.lang,
        card_faces: japaneseCard.card_faces?.map((face: any) => ({
          name: face.name,
          printed_name: face.printed_name
        }))
      });

      return japaneseCard;
    }

    console.log(`[findJapaneseVersion] No Japanese version in response for ${card.name}`);
    return null;
  } catch (error) {
    console.error(`[findJapaneseVersion] Error finding Japanese version for ${card.name}:`, error);
    return null;
  }
}

/**
 * カードに日本語情報を追加
 * 既に日本語版の場合はそのまま返し、英語版の場合は日本語版を検索して情報をマージ
 */
export async function enrichWithJapanese(card: Card): Promise<Card> {
  console.log(`[enrichWithJapanese] Processing card: ${card.name}`);

  // 既に日本語の印刷名を持っている場合はそのまま返す
  // printed_nameが英語名と同じ場合は日本語版が取得できていないと判断
  if (card.printed_name && card.printed_name !== card.name) {
    console.log(`[enrichWithJapanese] Card already has Japanese info: ${card.name} (${card.printed_name})`);
    return card;
  }

  console.log(`[enrichWithJapanese] No Japanese name yet, searching: ${card.name}`);

  // 日本語版を検索
  const japaneseCard = await findJapaneseVersion(card);

  if (japaneseCard) {
    // 両面カード（DFC）の場合、card_facesから日本語名を取得
    let printedName = japaneseCard.printed_name;
    let printedTypeLine = japaneseCard.printed_type_line;
    let printedText = japaneseCard.printed_text;

    console.log(`[enrichWithJapanese] DEBUG - printedName: ${printedName}, has card_faces: ${!!japaneseCard.card_faces}, faces count: ${japaneseCard.card_faces?.length || 0}`);

    if (!printedName && japaneseCard.card_faces && japaneseCard.card_faces.length > 0) {
      console.log(`[enrichWithJapanese] DEBUG - Processing card_faces for ${card.name}`);
      // card_facesが存在する場合、各faceのprinted_nameを連結
      // ただし、printed_nameがnameと同じ場合は日本語版が存在しないと判断
      const faceNames = japaneseCard.card_faces
        .map((face: any) => {
          if (face.printed_name && face.printed_name !== face.name) {
            return face.printed_name;
          }
          return face.name;
        })
        .join(' // ');
      console.log(`[enrichWithJapanese] DEBUG - Joined face names: ${faceNames}`);

      // 全てのfaceで printed_name == name の場合、日本語版が存在しない
      const hasJapaneseNames = japaneseCard.card_faces.some(
        (face: any) => face.printed_name && face.printed_name !== face.name
      );
      if (hasJapaneseNames) {
        printedName = faceNames;
      }

      // type_lineとtextも同様に
      const faceTypeLines = japaneseCard.card_faces
        .map((face: any) => face.printed_type_line || face.type_line)
        .join(' // ');
      printedTypeLine = faceTypeLines;

      const faceTexts = japaneseCard.card_faces
        .map((face: any) => face.printed_text || face.oracle_text)
        .join('\n---\n');
      printedText = faceTexts;
    }

    // 両面カードの場合、image_urisとmana_costをトップレベルにコピー
    let imageUris = japaneseCard.image_uris;
    let manaCost = japaneseCard.mana_cost;

    if (!imageUris && japaneseCard.card_faces && japaneseCard.card_faces.length > 0) {
      // 最初の面の画像URLを使用
      imageUris = japaneseCard.card_faces[0].image_uris;
      console.log(`[enrichWithJapanese] DEBUG - Using image_uris from card_faces[0]`);
    }

    if (!manaCost && japaneseCard.card_faces && japaneseCard.card_faces.length > 0) {
      // 最初の面のマナコストを使用
      manaCost = japaneseCard.card_faces[0].mana_cost;
      console.log(`[enrichWithJapanese] DEBUG - Using mana_cost from card_faces[0]: ${manaCost}`);
    }

    // 日本語版の情報を元のカードにマージ
    const enrichedCard = {
      ...card,
      printed_name: printedName || japaneseCard.name,
      printed_type_line: printedTypeLine || japaneseCard.type_line,
      printed_text: printedText || japaneseCard.oracle_text,
      image_uris: imageUris || card.image_uris,
      mana_cost: manaCost || card.mana_cost,
      card_faces: japaneseCard.card_faces || card.card_faces,
    };
    console.log(`[enrichWithJapanese] Card enriched: ${card.name} -> ${enrichedCard.printed_name}`);
    return enrichedCard;
  }

  // 日本語版が見つからない場合はそのまま返す
  console.log(`[enrichWithJapanese] No Japanese version found for ${card.name}`);
  return card;
}

/**
 * 複数のカードに対して日本語情報を追加
 */
export async function enrichManyWithJapanese(cards: Card[]): Promise<Card[]> {
  const promises = cards.map(card => enrichWithJapanese(card));
  return Promise.all(promises);
}
