
export const mapGenderFromDB = (dbGender: string | null) => {
  if (!dbGender) return '';
  
  switch (dbGender.toUpperCase()) {
    case 'MALE':
    case 'MASCULINO':
      return 'Masculino';
    case 'FEMALE':
    case 'FEMININO':
      return 'Feminino';
    case 'OTHER':
    case 'OUTRO':
      return 'Outro';
    default:
      return dbGender;
  }
};

export const mapGenderToDB = (displayGender: string) => {
  switch (displayGender) {
    case 'Masculino':
      return 'MALE';
    case 'Feminino':
      return 'FEMALE';
    case 'Outro':
      return 'OTHER';
    default:
      return displayGender;
  }
};
