export type InsuranceStatus = 'Valid' | 'Expired' | 'Not Exist';

export interface Vehicle {
  plateNumber: string;
  arabicLetters: string[];
  registrationType: string;
  bodyType: string;
  make: string;
  model: string;
  year: string;
  serialNumber: string;
  color: string;
  licenseExpiry: string;
  userId: string;
  userName: string;
  chassis: string;
  insurance: InsuranceStatus;
  status: string;
  ownershipDate: string;
}

export const ARABIC_TO_LATIN: Readonly<Record<string, string>> = {
  أ: 'A',
  ا: 'A',
  ب: 'B',
  ح: 'J',
  د: 'D',
  ر: 'R',
  س: 'S',
  ص: 'X',
  ط: 'T',
  ع: 'E',
  ق: 'G',
  ك: 'K',
  ل: 'L',
  م: 'Z',
  ن: 'N',
  ه: 'H',
  هـ: 'H',
  و: 'U',
  ي: 'V',
  ى: 'V'
};

export const englishLetters = (letters: string[]) =>
  [...letters].reverse().map((letter) => ARABIC_TO_LATIN[letter] ?? '?');

const vehicle = (
  plateNumber: string,
  letters: string,
  model: string,
  year: string,
  serialNumber: string,
  licenseExpiry: string,
  userId: string,
  userName: string,
  chassis: string,
  insurance: InsuranceStatus,
  ownershipDate: string,
  bodyType = '3 Wheels'
): Vehicle => ({
  plateNumber,
  arabicLetters: letters.split(' '),
  registrationType: 'نقل خاص',
  bodyType,
  make: 'تويوتا',
  model,
  year,
  serialNumber,
  color: 'أبيض',
  licenseExpiry,
  userId,
  userName,
  chassis,
  insurance,
  status: 'ساري',
  ownershipDate
});

export const VEHICLES: Vehicle[] = [
  vehicle('6013', 'أ ن ع', 'فان بضاعه', '2013', '188253210', '1449-06-10', '2517847386', 'JASEEL THALAPPADI MALAYIL', 'JTFHX02P1D0076493', 'Valid', '1434-06-10'),
  vehicle('6349', 'أ م ب', 'فان بضاعه', '2012', '719645110', '1448-07-12', '2587177953', 'JUNAID MADATHIL KUNNUMMAL', 'JTFHX02P4C0068743', 'Expired', '1433-07-12'),
  vehicle('1077', 'ب ر ي', 'هاي ايس', '2021', '342489710', '1451-01-19', '', '', 'JTFRAFAPXM8014103', 'Not Exist', '1442-01-19'),
  vehicle('1901', 'ب س ل', 'هاي ايس', '2021', '996375810', '1449-01-03', '', '', 'JTFLAFCPXM6009272', 'Not Exist', '1443-01-03'),
  vehicle('7038', 'ب ح ي', 'فان بضاعه', '2017', '649791610', '1447-12-21', '2604353009', 'ADIL KARAPPAKUZHIYIL', 'JTFHS02P8H0105055', 'Expired', '1438-12-21'),
  vehicle('4376', 'ب ص ط', 'فان', '2023', '966215910', '1450-05-14', '', '', 'JTFLAFCP7P6017009', 'Valid', '1444-05-14'),
  vehicle('4926', 'أ ه ق', 'فان بضاعه', '2014', '886781310', '1450-05-15', '', '', 'JTFPX22P9E0045467', 'Valid', '1435-05-15'),
  vehicle('6566', 'ب ر ل', 'فان', '2020', '989567710', '1450-09-13', '', '', 'JTFLAFCP0L6003849', 'Expired', '1441-09-13'),
  vehicle('5479', 'ب ع و', 'فان بضاعه', '2019', '462011710', '1449-08-11', '2637336088', 'MOHAMMED RAFEEQUE THAZHATHE PALLIYALI', 'JTFRAFAP5K8001398', 'Valid', '1440-08-11', '4 Wheels'),
  vehicle('4207', 'أ ه د', 'فان بضاعه', '2013', '33047210', '1449-11-13', '', '', 'JTFPX22P8D0041702', 'Valid', '1434-11-13'),
  vehicle('1104', 'ب ب ي', 'فان بضاعه', '2016', '959534510', '1449-10-09', '', '', 'JTFHS02P4G0103463', 'Expired', '1437-10-09'),
  vehicle('4780', 'أ م ح', 'هاي ايس', '2012', '940926110', '1448-08-14', '2506729785', 'SUHAIB NEERANI', 'JTFPX22P3C0032193', 'Expired', '1433-08-14'),
  vehicle('9629', 'ب ب ر', 'فان بضاعه', '2016', '955381510', '1449-06-20', '2590572380', 'JABIR HUSSAIN VADAKKE PURATH', 'JTFHX02P9G0103766', 'Expired', '1437-06-20'),
  vehicle('9001', 'ب ب أ', 'فان بضاعه', '2015', '679300510', '1449-04-08', '', '', 'JTFPX22PXF0061436', 'Valid', '1437-04-08')
];

export const INSURANCE_LABEL: Readonly<Record<InsuranceStatus, string>> = {
  Valid: 'ساري',
  Expired: 'منتهي',
  'Not Exist': 'غير موجود'
};

export const INSURANCE_FILTERS = ['الكل', 'ساري', 'منتهي', 'غير موجود'] as const;
