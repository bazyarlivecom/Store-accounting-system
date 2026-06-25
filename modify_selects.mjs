import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `<option value="false">\n                                      {product.unit} (اصلی)\n                                    </option>\n                                    <option value="true">\n                                      {product.secondaryUnit} (فرعی)\n                                    </option>`;
const rep1 = `<option value="false">\n                                      {product.unit} (اصلی) - {formatNumber(item.isSecondaryUnit ? (item.unitPrice / (product.unitRatio || 1)) : item.unitPrice)}\n                                    </option>\n                                    <option value="true">\n                                      {product.secondaryUnit} (فرعی) - {formatNumber(item.isSecondaryUnit ? item.unitPrice : (item.unitPrice * (product.unitRatio || 1)))}\n                                    </option>`;

let replaced = content.split(target1).join(rep1);

const target2 = `<option value="false">\n                                        {product.unit} (اصلی)\n                                      </option>\n                                      <option value="true">\n                                        {product.secondaryUnit} (فرعی)\n                                      </option>`;
const rep2 = `<option value="false">\n                                        {product.unit} (اصلی) - {formatNumber(item.isSecondaryUnit ? (item.unitPrice / (product.unitRatio || 1)) : item.unitPrice)}\n                                      </option>\n                                      <option value="true">\n                                        {product.secondaryUnit} (فرعی) - {formatNumber(item.isSecondaryUnit ? item.unitPrice : (item.unitPrice * (product.unitRatio || 1)))}\n                                      </option>`;

replaced = replaced.split(target2).join(rep2);

fs.writeFileSync('src/App.tsx', replaced);
console.log('Replaced', content.split(target1).length - 1 + content.split(target2).length - 1, 'occurrences');
