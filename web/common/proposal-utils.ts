export const typeToReadableName = (type:string) => {
  if (type === 'change_risk_parameter') {
    return 'Change Risk Parameter';
  } else if (type === 'new_collateral_type') {
    return 'New Collateral Type';
  }

  return type;
};

export const deductTitle = (type:string) => {
  if (type === 'change_risk_parameter') {
    return 'on collateral type';
  } else if (type === 'new_collateral_type') {
    return 'Introduce new collateral type';
  }

  return type;
};

export const changeKeyToHumanReadable = (keyName: string) => {
  if (keyName === 'liquidation_penalty') {
    return 'Liquidation Penalty';
  } else if (keyName === 'maximum_debt') {
    return 'Maximum Debt';
  } else if (keyName === 'liquidation_ratio') {
    return 'Liquidation Ratio';
  }

  return 'unknown';
};
