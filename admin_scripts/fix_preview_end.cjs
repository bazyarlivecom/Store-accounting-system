const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const strEnd = `                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Bottom save triggers */}`;

const targetEndStr = `                            </div>
                          </div>
                        </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Bottom save triggers */}`;
code = code.replace(strEnd, targetEndStr);

fs.writeFileSync('src/App.tsx', code);
console.log('done wrap end');
