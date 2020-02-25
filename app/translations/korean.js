// @flow
const INPUTS = {
  inputSelectPlaceholder: '선택',
  inputPasswordPlaceholder: '비밀번호',
  inputEncryptedPlaceholder: '암호화 키',
  authPrivateKeyPlaceholder: '프라이빗 키를 입력해주세요',
  authWatchPlaceholder: 'NEO 주소를 입력해주세요',
}

const VARIOUS_MISSING_TRANSLATIONS = {
  'auth.cancel': 'Cancel',
  'auth.ledger.connectLedger': '연결 후 원장 기기를 잠금 해제 해주세요',
  'auth.ledger.navigateToNeoApp': 'NEO 앱을 기기로 이동합니다',
  'auth.ledger.retry': 'Retry?',
  'auth.ledger.fetchAddress': 'Fetch additional addresses',
  publicAddress: 'Public Address',
  'auth.import.recoveryInstructions':
    'Upload a JSON wallet recovery file here to add your accounts to Neon. This option is also available on the Settings page.',
  importFile: 'Import File',
  dashboardTokenBalancesPrice: '가격',
  dashboardTokenBalancesHoldings: '지주',
}

const AUTH = {
  authLogin: '로그인',
  authSaved: '저장됨',
  authPrivate: '개인',
  authEncrypted: '암호화됨',
  authWatch: '보기',
  authLedger: '원장',
  authCreateWallet: '월렛 만들기',
  authImportWallet: '월렛 불러오기',
  authScanQRButton: 'QR코드 스캔',
  authLoginButton: '로그인',
  authLedgerFirstStep: '연결 후 원장 기기를 잠금 해제 해주세요',
  authLedgerSecondStep: 'NEO 앱을 기기로 이동합니다',
  authLedgerAddressLabel: '퍼블릭 주소',
}

const WALLET_CREATION = {
  createANewWallet: '신규 월렛 생성',
  walletCreationInstruction: '세부 정보 입력',
  walletCreationWalletNameLabel: '월렛 이름',
  walletCreationWalletNamePlaceholder: '월렛 이름',
  walletCreationWalletPasswordLabel: '패스프레이즈',
  walletCreationWalletPasswordPlaceholder: '비밀번호',
  walletCreationWalletPasswordConfirmLabel: '비밀번호 확인',
  walletCreationWalletPasswordConfirmPlaceholder: '비밀번호 확인',
  walletCreationButton: '월렛 만들기',
  walletCreatedHeader: 'Wallet Created!',
  walletCreatedDisclaimer:
    '<b>세부사항을 저장하십시오!</b> 크리덴셜을 잃게 되면 자산 액세스 권한이 상실됩니다.',
  privateKeyLabel: 'PRIVATE KEY',
  encryptedKeyLabel: 'ENCRYPTED KEY',
  addressLabel: '퍼블릭 주소',
  splitKeyLabel: 'SPLIT KEY',
  recoverWalletLabel: 'RECOVER WALLET',
  print: 'Print',
  generateQrCodes: 'Generate QR Codes',
  copyCodeImage: 'Copy Code Image',
}

const DASHBOARD = {
  dashboardBalancePanelLabel: '토큰 잔액',
  dashboardAssetsPanelLabel: '시스템 자산',
  dashboardAssetsTotal: '총',
  dashboardMarketDataLabel: '시장 데이터',
  dashboardValueLabel: '총 월렛 ',
  dashboardAddressLabel: '주소:',
  dashboardPriceNotAvailable: 'N/A',
  dashboardGasClaimButton: '{amount} GAS 청구',
  dashboardManageWallets: '월렛 관리',
  dashboardRefresh: '업데이트',
  dashboardTokenBalancesToken: '토큰',
  dashboardMarketData1Day: '1일',
  dashboardMarketData1Week: '1주',
  dashboardMarketData1Month: '1개월',
}

const SIDEBAR = {
  sidebarWallet: '월렛',
  sidebarActivity: '활동',
  sidebarSend: '보내기',
  sidebarReceive: '받기',
  sidebarContacts: '연락처',
  sidebarTokenSale: '토큰 판매',
  sidebarNews: '뉴스',
  sidebarSettings: '설정',
  sidebarLogout: '로그아웃',
  sidebarCurrentBlock: '현 블록',
}

const MANAGE_WALLETS = {
  manageWalletsLabel: '월렛 관리',
  manageWalletsImport: '불러오기',
  manageWalletsCreate: '생성',
  manageWalletsEdit: '수정',
  manageWalletsEditWallet: '월렛 수정',
  manageWalletsEditWalletInstructions: '디테일 수정',
  manageWalletsEditWalletNameLabel: '월렛 이름',
  manageWalletsEditWalletNamePlaceholder: '월렛 이름',
  manageWalletsEditWalletAddressLabel: '월렛 주소',
  manageWalletsEditWalletSave: '변경사항 저장',
}

const ACTIVITY = {
  activityAddAddress: '추가',
  activityViewTx: '보기',
  activityPageLabel: '활동',
  activityExport: '내보내기',
}

const RECEIVE = {
  recieveSelectMethod: '예금 방법 선택',
  receiveAssetsAddressLabel: '퍼블릭 주소',
  receivePageLabel: '자산 받기',
  receiveYourAddressTabLabel: '주소',
  receiveCopyCodeButton: '코드 이미지 복사',
  receiveDisclaimer:
    '<b>NEO 블록체인(NEO, GAS 등)과 호환되는</b> 자산만 전송합니다. 다른 자산 전송 시, 영구적인 손실이 발생합니다.',
  receiveRequestTabAssets: '자산 요청',
  recieveWhyUseQRLabel: '왜 QR코드를 사용하나요?',
  receiveQRExplanation:
    '<p>월렛 주소를 잘못 입력하여 자산을 잘못된 주소로 보낸 적이 있으신가요?</p><p>없다면 다행이지만, 빈번히 일어나는 일입니다.</p> <p>여기 COZ에서는, 당신의 올바른 세부 사항으로 지불할 수 있도록, 자산 요청 QR코드를 생성하실 수 있습니다.</p><p>생성되는 모든 코드에는 사용자가 설정한 퍼블릭 월렛 주소, 자산 금액 및 레퍼런스가 포함되어 있습니다.</p>',
}

const REQUEST_ASSETS = {
  requestAssetLabel: '자산',
  requestAssetAmountLabel: '총액',
  requestAssetAmount: '총액',
  requestAssetDepositLabel: '월렛으로 예금',
  requestAssetRefLabel: '레퍼런스',
  requestAssetRefPlaceholder: '노트 추가...',
  requestAssetQRButton: 'QR코드 생성',
  requestAssetYourQRHeader: 'QR코드',
  requestAssetsPaymentDetails: '지불 요청 세부 사항',
  requestAssetsYourQRLabel: 'QR코드',
  requestAssetsRefLabel: '레퍼런스',
  requestAssetsAddressLabel: '주소',
  requestAssetsAmountLabel: '총액',
  requestAssetsAssetLabel: '자산',
}

const TRANSACTION_FEE = {
  transactionFeeQuestion: '수수료로 우선 순위를 매겨 거래하시겠습니까?',
  fast: '빠르게',
  faster: '더 빠르게',
  fastest: '제일 빠르게',
  sendWithFee:
    '수수료 붙여 {itemCount, plural, one {asset} other {assets}} 보내기',
  sendWithOutFee:
    '수수료 없이 {itemCount, plural, one {asset} other {assets}} 보내기',
  asset: '자산',
  assets: '자산',
}

const SEND = {
  sendPageLabel: '자산 보내기',
  sendImport: '불러오기',
  sendEnterQRCode: 'QR코드 입력',
  sendAdd: '수취인 추가',
  sendAssetLabel: '자산 보내기',
  sendAmountLabel: '총액',
  sendAddressLabel: '수취인 주소',
  sendAddressPlaceholder: '월렛 추가 및 연락처 선택',
  sendTranfer: 'TRANSFER',
  sendMaxAmount: '최대',
  sendTransferPlural: 'TRANSFERS',
  sendAsset: '자산',
  sendAssets: '자산',
  sendRecipient: '수취인',
  sendRecipients: '수취인',
  sendAssetCapital: '자산',
  sendAssetsCapital: '자산',
  sendRecipientCapital: '수취인',
  sendRecipientsCapital: '수취인',
  sendCompleteNotification:
    '트랜잭션을 보류 중입니다. 블록체인이 처리하면 잔액이 자동으로 업데이트됩니다.',
  sendSelectAssets: '{25, number} 수취인의 {transferCount, number} 자산 선택',
  sendTransferMessage:
    '{transferCount, number} {transferCount, plural, one {sendTransfer} other {sendTransferPlural}} 보류 중',
  sendBroadcasting: '네트워크로 트랜잭션 브로드캐스팅 중...',
  sendDisclaimer:
    '자금 손실이 일어나지 않도록 정확한 세부사항을 입력하셨는지 검토해주시길 바랍니다.',
  sendActivityLink: '활동 탭에서 거래 상태를 확인합니다.',
  sendCompletion:
    '완료! {transferCount, plural, one {sendRecipient} other {sendRecipients}}로 {transferCount, number} {transferCount, plural, one {sendAsset} other {sendAssets}} ',
}

const SETTINGS = {
  settingsNetworkConfigLabel: '네트워크 구성',
  settingCurrencyLabel: '통화',
  settingsThemeLabel: '테마',
  settingsSoundLabel: '소리',
  settingsEncryptLink: '키 암호화',
  recoverWallet: '월렛 복구',
  settingsRecoverWalletLink: '불러오기',
  settingsBackUpLinkLabel: '월렛 백업',
  settingsBackUpLink: '내보내기',
  settingsManageLabel: '네온 지갑 관리',
  settingsCommunity: '커뮤니티 지원',
  settingsDonationLink:
    'Created by COZ. 후원: Adr3XjZ5QDzVJrWvzmsTTchpLRRGSzgS5A',
}

const NETWORK_SETTINGS = {
  networkSettingsInstructions:
    'Neon Wallet이 블록 체인과 상호 작용하는 방법과 관련된 모든 네트워크 설정을 관리합니다.',
  networkSettingsNodeSelectLabel: '노드 선택',
  networkSettingsExplorerLabel: '블록 익스플로러',
  networkSettingsCurrentLabel: '현재 네트워크',
  networkSettingsAutomatic: '자동화',
}

const NODE_SELECTION = {
  nodeSelectPanelHeader: '노드 선택',
  nodeSelectionInstructions:
    '성능 문제가 발생하는 경우 아래에서 사용자 지정 노드를 선택하십시오.',
  nodeSelectSelectAutomatically: '자동으로 선택',
  nodeSelectInfo: '상위 {nodeCount, number}개의 노드가 나열됨',
  nodeSelectBlockHeight: '블록 높이',
}

const ENCRYPT_KEY = {
  encryptPanelHeader: '키 암호화',
  encryptInstructions: '기존 키를 암호화할 암호 선택',
  encryptStep1Label: '1) 암호화할 프라이빗 키 입력',
  encryptStep1Placeholder: '키 입력',
  encryptStep2Label: '2) 암호 생성',
  encryptStep2Placeholder: '암호 입력',
  encryptStep3Label: '3) 암호 확인',
  encryptStep3Placeholder: '암호 확인',
  encryptButton: '암호화된 키 생성',
}

const TOKEN_SALE = {
  tokenSalePageHeader: '토큰 세일 참여',
  tokenSaleDisclaimer1: '계속하려면 이 문장을 읽고 승인해 주십시오.',
  tokenSaleDiclaimer2:
    'NEO나 GAS를 여러 번 제출하면 ICO사의 방침에 따라 자금 손실이 발생하거나 환불이 지연될 수 있는 것으로 알고 있습니다.',
  tokenSaleDisclaimer3:
    '일부 판매는 NEO 또는 GAS만 수락할 수 있으며, 어느 것이 받아들여지는지 확인했습니다.',
  tokenSaleDisclaimer4:
    '이미 끝난 토큰 세일에 NEO나 GAS를 보내면 NEO/GAS가 없어져 환불이 되지 않는 것으로 알고 있습니다.',
  tokenSaleDiclaimer5:
    // eslint-disable-next-line
    'COZ는 이 기능의 사용에 대한 책임이 없으며 이 소프트웨어의 라이센스에 문의했습니다.',
}

export default {
  ...AUTH,
  ...INPUTS,
  ...WALLET_CREATION,
  ...DASHBOARD,
  ...SIDEBAR,
  ...MANAGE_WALLETS,
  ...ACTIVITY,
  ...RECEIVE,
  ...REQUEST_ASSETS,
  ...TRANSACTION_FEE,
  ...SEND,
  ...SETTINGS,
  ...NETWORK_SETTINGS,
  ...NODE_SELECTION,
  ...ENCRYPT_KEY,
  ...TOKEN_SALE,
  ...VARIOUS_MISSING_TRANSLATIONS,
}