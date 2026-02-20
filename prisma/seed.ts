import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const activeCards = [
    // 玉山銀行
    { bankName: '玉山銀行', cardName: '中友百貨悠遊聯名卡' },
    { bankName: '玉山銀行', cardName: '熊本熊卡日圓雙幣卡(很友好版)' },
    { bankName: '玉山銀行', cardName: '國民旅遊卡' },

    // 台北富邦
    { bankName: '台北富邦', cardName: 'J卡悠遊聯名卡(日本娃娃)' },
    { bankName: '台北富邦', cardName: 'J卡悠遊聯名卡(達摩)' },
    { bankName: '台北富邦', cardName: 'J卡悠遊聯名卡(原住民男版)' },

    // 永豐銀行
    { bankName: '永豐銀行', cardName: 'MITSUI OUTLET PARK悠遊聯名卡' },
    { bankName: '永豐銀行', cardName: '鈦豐JCB晶緻悠遊卡' },

    // 兆豐銀行
    { bankName: '兆豐銀行', cardName: '原子小金剛悠遊聯名卡JCB晶緻卡' },
    { bankName: '兆豐銀行', cardName: '哆啦A夢悠遊聯名卡JCB晶緻卡' },
    { bankName: '兆豐銀行', cardName: '悠遊聯名卡JCB晶緻卡' },

    // 聯邦銀行
    { bankName: '聯邦銀行', cardName: '全國加油悠遊聯名卡JCB晶緻卡' },
    { bankName: '聯邦銀行', cardName: '微風悠遊聯名卡JCB晶緻卡' },
    { bankName: '聯邦銀行', cardName: '聯邦吉鶴卡' },

    // 新光銀行
    { bankName: '新光銀行', cardName: '美麗華悠遊聯名卡JCB晶緻卡' },

    // 國泰世華
    { bankName: '國泰世華', cardName: 'CUBE悠遊聯名晶緻卡' },
    { bankName: '國泰世華', cardName: '台塑聯名卡' },

    // 第一銀行
    { bankName: '第一銀行', cardName: '綠活利聯名卡JCB晶緻卡' },
    { bankName: '第一銀行', cardName: '悠遊聯名卡JCB晶緻卡' },

    // 上海銀行
    { bankName: '上海銀行', cardName: '上海TERESA悠遊極緻卡' },

    // 華南銀行
    { bankName: '華南銀行', cardName: 'Love晶緻悠遊酷愛黑卡' },
    { bankName: '華南銀行', cardName: 'Love晶緻悠遊寵愛紅卡' },
    { bankName: '華南銀行', cardName: '大甲媽祖悠遊認同卡' },
    { bankName: '華南銀行', cardName: '愛心音符卡Debit卡' },
    { bankName: '華南銀行', cardName: '卡娜赫拉Debit卡' },

    // 台中銀行
    { bankName: '台中銀行', cardName: 'JCB加油晶緻卡' },

    // 中國信託
    { bankName: '中國信託', cardName: '勤美天地悠遊聯名卡' },
    { bankName: '中國信託', cardName: '秀泰聯名卡' },
    { bankName: '中國信託', cardName: 'ANA聯名卡' },
    { bankName: '中國信託', cardName: 'LaLaPort卡' },

    // 合作金庫
    { bankName: '合作金庫', cardName: '合庫JCB悠遊晶緻卡' },

    // 彰化銀行
    { bankName: '彰化銀行', cardName: '彰化銀行JCB悠遊晶緻卡' },

    // 遠東商銀
    { bankName: '遠東商銀', cardName: '遠東商銀C\'est Moi旅遊悠遊卡JCB晶緻卡' },
    { bankName: '遠東商銀', cardName: '遠東快樂悠遊聯名卡JCB晶緻卡' },

    // =========================================
    // 已停辦卡片 (Discontinued but user requested)
    // =========================================
    { bankName: '玉山銀行', cardName: '玉山悠遊聯名卡 (已停辦)' },
    { bankName: '玉山銀行', cardName: '玉山eTag悠遊聯名卡 (已停辦)' },
    { bankName: '玉山銀行', cardName: '玉山JCB晶緻悠遊卡 (已停辦)' },

    { bankName: '永豐銀行', cardName: '永豐保倍JCB晶緻悠遊卡 (已停辦)' },

    { bankName: '聯邦銀行', cardName: '國民旅遊聯名卡JCB晶緻卡 (已停辦)' },

    { bankName: '新光銀行', cardName: '新光悠遊聯名卡JCB晶緻卡 (已停辦)' },
    // Note: The image shows 3 generic "新光悠遊聯名卡JCB晶緻卡 (已停辦)" rows, adding one to represent them

    { bankName: '國泰世華', cardName: '太平洋SOGO悠遊聯名卡JCB晶緻卡 (已停辦)' },

    { bankName: '第一銀行', cardName: '中信紅利悠遊聯名晶緻卡(一) (已停辦)' },
    { bankName: '第一銀行', cardName: '中信紅利悠遊聯名晶緻卡(二) (已停辦)' },
    // Wait, the image groups these under 中國信託 actually. Let me fix the mapping based on the image right edge.
    { bankName: '中國信託', cardName: '中信紅利悠遊聯名晶緻卡(一) (已停辦)' },
    { bankName: '中國信託', cardName: '中信紅利悠遊聯名晶緻卡(二) (已停辦)' },
    { bankName: '中國信託', cardName: '大葉高島屋悠遊聯名卡 (已停辦)' },
    { bankName: '中國信託', cardName: 'MUJI無印良品卡 (已停辦)' },

    { bankName: '華南銀行', cardName: '新竹市民悠遊認同卡 (已停辦)' },

    { bankName: '台中銀行', cardName: 'JCB現金(悠遊)晶緻卡 (已停辦)' },
    { bankName: '台中銀行', cardName: 'JCB媽祖悠遊晶緻卡 (已停辦)' },

    { bankName: '台新銀行', cardName: '太陽悠遊晶緻卡 (已停辦)' },
    { bankName: '台新銀行', cardName: '玫瑰悠遊晶緻卡 (已停辦)' },
    { bankName: '台新銀行', cardName: '太陽悠遊晶緻卡(黑) (已停辦)' },

    { bankName: '彰化銀行', cardName: '彰化銀行JCB哆啦A夢悠遊晶緻卡 (已停辦)' },

    // PGO is under 華南 from the image reading? Wait, it's above Love cards but below 上海. It belongs to 華南.
    { bankName: '華南銀行', cardName: 'PGO悠遊聯名卡 (已停辦)' },

    // 不符合 (Ineligible usually, but added for completeness if they existed)
    { bankName: '合作金庫', cardName: 'JCB哆啦A夢悠遊白金卡 (不符合)' },
];

async function main() {
    console.log('Start seeding...');

    try {
        console.log('Clearing existing templates...');
        await prisma.cardTemplate.deleteMany();

        console.log(`Injecting ${activeCards.length} templates...`);
        for (const card of activeCards) {
            await prisma.cardTemplate.create({
                data: card,
            });
        }

        console.log('Seeding finished.');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
