const xml = require('jstoxml');
const req = require('request');
var xmlConvert = require('xml-js');

class pagseguro {

  constructor(configObj) {

    this.credentials = {};
    this.credentials.email = configObj.credentials.email;

    if (configObj.credentials.production) {
      this.credentials.production = {
        appID: configObj.credentials.production.appID,
        appKey: configObj.credentials.production.appKey,
        token: configObj.credentials.production.token
      };
    }

    if (configObj.credentials.sandbox) {
      this.credentials.sandbox = {
        appID: configObj.credentials.sandbox.appID,
        appKey: configObj.credentials.sandbox.appKey,
        token: configObj.credentials.sandbox.token
      };
    }

    this.mode = configObj.mode || "payment";

    if (configObj.sandbox) {
      this.isSandbox(true);
    } else {
      this.isSandbox(false);
    }

    if (configObj.appMode) {
      this.setAppMode(true);
    } else {
      this.setAppMode(false);
    }

    this.version = 'v2';

    this.obj = {};
    this.xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

    return;

  }

  changeMode(newMode) {
    this.mode = newMode || "payment";
  }

  changeCredentials() {

    if (data.email) {
      this.credentials.email = data.email;
    }

    if (data.production) {
      this.credentials.production = {
        appID: data.production.appID,
        appKey: data.production.appKey,
        token: data.production.token
      };
    }

    if (data.sandbox) {
      this.credentials.sandbox = {
        appID: data.sandbox.appID,
        appKey: data.sandbox.appKey,
        token: data.sandbox.token
      };
    }

    if (this.sandbox) {
      this.isSandbox(true);
    } else {
      this.isSandbox(false);
    }

    return;

  }

  isSandbox(sandbox = false) {

    this.email = this.credentials.email;

    if (sandbox) {

      this.uri = "https://ws.sandbox.pagseguro.uol.com.br/";
      this.uri2 = "https://sandbox.pagseguro.uol.com.br/";

      this.token = this.credentials.sandbox.token;
      this.appID = this.credentials.sandbox.appID;
      this.appKey = this.credentials.sandbox.appKey;

      this.sandbox = true;

    } else {

      this.uri = "https://ws.pagseguro.uol.com.br/";
      this.uri2 = "https://pagseguro.uol.com.br/";

      this.token = this.credentials.production.token;
      this.appID = this.credentials.production.appID;
      this.appKey = this.credentials.production.appKey;

      this.sandbox = false;

    }

  }

  setCurrency(cur) {
    this.obj.currency = cur;
    return;
  }

  setReference(ref) {
    this.obj.reference = ref;
    return;
  }

  addItem(item) {

    if (this.mode === 'subscription') {
      throw new Error("This function is for payment mode only!");
    }

    if (this.obj.items == null) {
      this.obj.items = [];
    }

    this.obj.items.push({
      item: item
    });

    return;

  }

  setBuyer(buyer) {

    this.obj.sender = {
      name: buyer.name,
      email: buyer.email,
      phone: {
        areaCode: buyer.phoneAreaCode,
        number: buyer.phoneNumber
      }
    };

    if (this.mode === 'subscription') {
      this.obj.sender.address = {};
      if (buyer.street != null) {
        this.obj.sender.address.street = buyer.street;
      }
      if (buyer.number != null) {
        this.obj.sender.address.number = buyer.number;
      }
      if (buyer.postalCode != null) {
        this.obj.sender.address.postalCode = buyer.postalCode;
      }
      if (buyer.city != null) {
        this.obj.sender.address.city = buyer.city;
      }
      if (buyer.state != null) {
        this.obj.sender.address.state = buyer.state;
      }
      if (buyer.country != null) {
        this.obj.sender.address.country = buyer.country;
      }
      if (buyer.complement != null) {
        this.obj.sender.address.complement = buyer.complement;
      }
      if (buyer.district != null) {
        this.obj.sender.address.district = buyer.district;
      }
    }

  }

  setShipping(shippingInfo) {

    switch (this.mode) {
      case 'payment':
        this.obj.shipping = {
          type: shippingInfo.type,
          address: {
            street: shippingInfo.street,
            number: shippingInfo.number,
            postalCode: shippingInfo.postalCode,
            city: shippingInfo.city,
            state: shippingInfo.state,
            country: shippingInfo.country
          }
        };
        if (shippingInfo.complement != null) {
          this.obj.shipping.complement = shippingInfo.complement;
        }
        if (shippingInfo.district != null) {
          this.obj.shipping.district = shippingInfo.district;
        }
        break;
      case 'subscription':
        if (this.obj.sender == null) {
          this.obj.sender = {};
        }
        this.obj.sender.address = {
          street: shippingInfo.street,
          number: shippingInfo.number,
          postalCode: shippingInfo.postalCode,
          city: shippingInfo.city,
          state: shippingInfo.state,
          country: shippingInfo.country
        };
        if (shippingInfo.complement != null) {
          this.obj.sender.address.complement = shippingInfo.complement;
        }
        if (shippingInfo.district != null) {
          this.obj.sender.address.district = shippingInfo.district;
        }
    }

    return;

  }

  setPreApproval(preApprovalInfo) {

    var maxTotalAmount, twoYearsFromNow;

    if (this.mode === 'subscription') {

      twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      maxTotalAmount = preApprovalInfo.maxTotalAmount * 1 || preApprovalInfo.amountPerPayment * 24 || preApprovalInfo.maxAmountPerPayment * 24;

      this.obj.preApproval = {
        charge: preApprovalInfo.charge || 'manual',
        finalDate: preApprovalInfo.finalDate
      };

      if (preApprovalInfo.name != null) {
        this.obj.preApproval.name = preApprovalInfo.name;
      }
      if (preApprovalInfo.details != null) {
        this.obj.preApproval.details = preApprovalInfo.details;
      }
      if (preApprovalInfo.period != null) {
        this.obj.preApproval.period = preApprovalInfo.period;
      }
      if (preApprovalInfo.amountPerPayment != null) {
        this.obj.preApproval.amountPerPayment = preApprovalInfo.amountPerPayment;
      }
      if (preApprovalInfo.maxAmountPerPayment != null) {
        this.obj.preApproval.maxAmountPerPayment = preApprovalInfo.maxAmountPerPayment;
      }
      if (preApprovalInfo.maxPaymentsPerPeriod != null) {
        this.obj.preApproval.maxPaymentsPerPeriod = preApprovalInfo.maxPaymentsPerPeriod;
      }
      if (preApprovalInfo.maxAmountPerPeriod != null) {
        this.obj.preApproval.maxAmountPerPeriod = preApprovalInfo.maxAmountPerPeriod;
      }
      if (preApprovalInfo.initialDate != null) {
        this.obj.preApproval.initialDate = preApprovalInfo.initialDate;
      }
    } else {
      throw new Error("This function is for subscription mode only!");
    }

    return;

  }

  setPrimaryReceiver(primaryReceiver) {

    if (typeof this.obj.primaryReceiver === "undefined") {
      this.obj.primaryReceiver = {};
    }

    if (typeof primaryReceiver === "string") {
      this.obj.primaryReceiver.publicKey = primaryReceiver;
    }

    return;

  }

  addreceiver(split, publicKey) {

    if (typeof this.obj.receivers === "undefined") {
      this.obj.receivers = [];
    }

    if (typeof split === "string" || typeof split === "number") {
      split = {
        amount: split
      };
    }

    this.obj.receivers.push({
      receiver: {
        publicKey: publicKey,
        split: split
      }
    });

    return;

  }

  createPlan(preApprovalInfo) {

    var options;
    const tinythis = this;
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1'
      }
    };

    options.body = preApprovalInfo;
    if (!options.body) {
      options.body = {};
    }

    options.body.reference = this.obj.reference;
    options.body.currency = this.obj.currency;
    options.body.notificationURL = this.obj.notificationURL;

    options.body = JSON.stringify(options.body);
    options.uri = this.uri + "pre-approvals?email=" + this.email + "&token=" + this.token;

    return new Promise(
      function (resolve, reject) {
        req(options, function (err, res, body) { tinythis.defaultJSONFilter(err, body, tinythis, resolve, reject) });
      }
    );

  }

  getCheckoutPlan(code) {
    return this.uri2 + this.version + `/pre-approvals/request.html?code=${code}`;
  }

  editPreApproval(code, newValue, updateUsers = false) {

    var options;
    const tinythis = this;
    options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1'
      }
    };

    options.body = JSON.stringify({
      "amountPerPayment": newValue,
      "updateSubscriptions": updateUsers
    });

    options.uri = this.uri + "/pre-approvals/request/" + code + "/payment?email=" + this.email + "&token=" + this.token;

    return new Promise(
      function (resolve, reject) {
        req(options, function (err, res, body) { tinythis.defaultJSONFilter(err, body, tinythis, resolve, reject) });
      }
    );

  }

  setStatusPlan(code, suspended) {

    var options;
    const tinythis = this;
    options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.pagseguro.com.br.v3+json;charset=ISO-8859-1'
      }
    };

    if (suspended) {
      options.body = JSON.stringify({
        "status": 'ACTIVE'
      });
    } else {
      options.body = JSON.stringify({
        "status": 'SUSPENDED'
      });
    }

    options.uri = this.uri + "/pre-approvals/" + code + "/status?email=" + this.email + "&token=" + this.token;

    return new Promise(
      function (resolve, reject) {
        req(options, function (err, res, body) { tinythis.defaultJSONFilter(err, body, tinythis, resolve, reject) });
      }
    );

  }

  /*
  Configura as URLs de retorno e de notificação por pagamento
   */
  setRedirectURL(url) {
    this.obj.redirectURL = url;
    return;
  }

  setNotificationURL(url) {
    this.obj.notificationURL = url;
    return;
  }

  setReviewURL(url) {
    if (this.mode === "subscription") {
      this.obj.reviewURL = url;
    } else {
      throw new Error("This function is for subscription mode only!");
    }
    return;
  }

  // JSON Items
  convertJSONError(body) {

    // Convert Error
    let errors = [];

    for (const item in body.errors) {
      errors.push({ code: item, message: body.errors[item] })
    }

    return errors;

  }

  defaultJSONFilter(err, body, tinythis, resolve, reject) {

    if (body) {
      try {
        body = JSON.parse(body);

        if (err) {
          reject([err]);
        } else {

          if (!body.error) {
            resolve(body);
          } else {
            const errors = tinythis.convertJSONError(body);
            reject(errors);
          }

        }

      } catch (e) {
        reject([e]);
      }
    } else {
      resolve(null);
    }

  }

  // Convert XML
  convertXMLError(body) {

    // Convert Error
    let errors = [];

    for (const item in body.elements) {
      if (body.elements[item].name === "errors") {
        const errorBase = {};
        for (const item2 in body.elements[item].elements) {
          for (const item3 in body.elements[item].elements[item2].elements) {

            const valueName = body.elements[item].elements[item2].elements[item3].name;
            for (const item4 in body.elements[item].elements[item2].elements[item3].elements) {
              errorBase[valueName] = body.elements[item].elements[item2].elements[item3].elements[item4].text;
            }

          }
        }
        errors.push(errorBase);
      }
    }

    return errors;

  }

  // Geter Code
  geterCode(err, body, tinythis, resolve, reject, callback) {

    if (err) {
      reject([err]);
    } else {

      // Convert XML
      try {

        body = xmlConvert.xml2json(body);
        body = JSON.parse(body);

        const errors = tinythis.convertXMLError(body);

        // No Error
        if (errors.length < 1) {
          resolve(callback(body));
        }

        // is Error
        else {
          reject(errors);
        }

      } catch (e) {
        reject([e]);
      }

    }

  }

  // Send Data
  send() {

    var options;
    const tinythis = this;
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8'
      }
    };

    switch (this.mode) {
      case 'payment':
        options.uri = this.uri + this.version + "/checkout" + this.getAppMode();
        options.body = this.xml + xml.toXML({
          checkout: this.obj
        });
        break;
      case 'subscription':
        options.uri = this.uri + this.version + "/pre-approvals/request" + this.getAppMode();
        options.body = this.xml + xml.toXML({
          preApprovalRequest: this.obj
        });
        break;
    }

    return new Promise(
      function (resolve, reject) {

        req(options, function (err, res, body) {
          tinythis.geterCode(err, body, tinythis, resolve, reject, function (body) {

            let checkout = {};
            for (const item in body.elements) {
              if (body.elements[item].name === "checkout" || body.elements[item].name === "preApprovalRequest") {
                for (const item2 in body.elements[item].elements) {

                  const tinyName = body.elements[item].elements[item2].name;
                  for (const item3 in body.elements[item].elements[item2].elements) {
                    checkout[tinyName] = body.elements[item].elements[item2].elements[item3].text;
                  }

                }
              };
            }

            switch (tinythis.mode) {
              case 'payment':
                checkout.codeURL = tinythis.uri2 + tinythis.version + '/checkout/payment.html?code=' + checkout.code;
                break;
              case 'subscription':
                checkout.codeURL = tinythis.getCheckoutPlan(checkout.code);
                break;
            }

            return checkout;

          });
        });

      }
    );

  }

  // Autorization Transfer
  createTransfer(data) {

    var options;
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.pagseguro.com.br.v1+json'
      }
    };

    options.uri = this.uri + "transfer/authorize?email=" + this.email + "&token=" + this.token;
    options.body = JSON.stringify({
      "receiverEmail": data.receiverEmail,
      "amount": data.amount,
      "description": data.description
    });

    return new Promise(
      function (resolve, reject) {

        req(options, function (err, res, body) {

          if (err) {
            reject(err);
          } else {
            resolve(body);
          }

        });

      }
    );

  }

  authorizeTransfer(code) {

    var options;
    options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.pagseguro.com.br.v1+json'
      }
    };

    options.uri = this.uri + "transfer/authorize?email=" + this.email + "&token=" + this.token;
    options.body = JSON.stringify({
      "authorizationCode": code
    });

    return new Promise(
      function (resolve, reject) {

        req(options, function (err, res, body) {

          if (err) {
            reject(err);
          } else {
            resolve(body);
          }

        });

      }
    );

  }

  // Get Balance
  getBalance() {

    var uri = this.uri + "transfer/balance?email=" + this.email + "&token=" + this.token;

    return new Promise(
      function (resolve, reject) {

        req({
          method: 'GET',
          headers: {
            'Content-Type': 'application/vnd.pagseguro.com.br.v1+json'
          },
          uri: uri

        }, function (error, response, body) {

          if (error) {
            reject(error);

          } else {
            resolve(body);
          }

        });

      });

  }

  // XML to JSON
  convertXMLtoJSON(body, error, tinythis, resolve, reject) {

    if (!error) {

      try {
        if (tinythis && resolve && reject) {
          body = xmlConvert.xml2json(body);
        }
      } catch (e) {
        if (tinythis && resolve && reject) {
          reject({ message: body, code: null });
        }
      }

      try {

        let errors;

        // Prepare Main
        if (tinythis && resolve && reject) {

          body = JSON.parse(body);
          errors = tinythis.convertXMLError(body);

        } else {
          errors = [];
        }

        // No Error
        if (errors.length < 1) {


          // Element
          if (body.type === 'element') {

            let result;

            // Check Elements
            let countRepeat = 0;
            for (const item in body.elements) {

              // Element Again
              if (body.elements[item].type === 'element') {

                if (typeof result === "undefined") {
                  result = {};
                }

                if (!result[body.elements[item].name]) {
                  result[body.elements[item].name] = this.convertXMLtoJSON(body.elements[item]);
                } else {
                  countRepeat++;
                  result[body.elements[item].name + "_" + countRepeat] = this.convertXMLtoJSON(body.elements[item]);
                }

              }

              // Another
              else {
                result = body.elements[item].text;
              }

            }

            return result;

          }

          // Start
          else if (!body.type) {
            const result = {};
            let items = 0;
            let lastItemName = '';
            for (const item in body.elements) {
              items++;
              lastItemName = body.elements[item].name;
              result[lastItemName] = this.convertXMLtoJSON(body.elements[item]);
            }
            if (items > 1) {
              resolve(result);
            } else {
              resolve(result[lastItemName]);
            }
          }

          // Content
          else {
            return null;
          }

        }

        // is Error
        else {
          reject(errors);
        }

      }

      // Catch
      catch (e) {
        if (tinythis && resolve && reject) {
          reject([e]);
        } else {
          return null;
        }
      }

    } else {
      reject([error]);
    }

  }

  // Get Transaction
  getTransaction(code) {

    const tinythis = this; tinythis;
    var uri = this.uri + this.version + "/transactions/" + code + this.getAppMode();

    return new Promise(
      function (resolve, reject) {

        req({
          method: 'GET',
          headers: {
            'Content-Type': 'application/xml; charset=ISO-8859-1'
          },
          uri: uri

        }, function (error, response, body) {
          tinythis.convertXMLtoJSON(body, error, tinythis, resolve, reject);
        });

      });

  }

  // Get Notification
  getNotification(code) {

    var uri = this.uri + this.version + "/transactions/notifications/" + String(code) + this.getAppMode();
    const tinythis = this;

    return new Promise(
      function (resolve, reject) {

        req({
          method: 'GET',
          headers: {
            'Content-Type': 'application/xml; charset=ISO-8859-1'
          },
          uri: uri

        }, function (error, response, body) {
          tinythis.convertXMLtoJSON(body, error, tinythis, resolve, reject);
        });

      });

  }

  // App Mode

  getAppMode() {

    let result = '';

    if (!this.appMode) {
      result = "?email=" + this.email + "&token=" + this.token;
    } else {
      if (this.appAuthorization) {
        result = "?appId=" + this.appID + "&appKey=" + this.appKey + "&authorizationCode=" + this.appAuthorization;
      } else {
        result = "?appId=" + this.appID + "&appKey=" + this.appKey;
      }
    }

    return result;

  }

  setAppMode(enabled, code = '') {

    if (!enabled) {
      this.appMode = false;
      this.appAuthorization = '';
    } else {
      this.appMode = true;
      this.appAuthorization = code;
    }

    return;

  }

  // Get App Authorization
  getAppAuthorization(data) {

    const tinythis = this;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=ISO-8859-1'
      },
      uri: this.uri + this.version + "/authorizations/request/?appId=" + this.appID + "&appKey=" + this.appKey
    };

    if (this.obj.reference) {
      data.reference = this.obj.reference;
    }

    if (this.obj.redirectURL) {
      data.redirectURL = this.obj.redirectURL;
    }

    if (this.obj.notificationURL) {
      data.notificationURL = this.obj.notificationURL;
    }

    if (data.permissions) {
      const newPermissions = [];
      for (const item in data.permissions) {
        newPermissions.push({
          code: data.permissions[item]
        });
      }
      data.permissions = newPermissions;
    }

    options.body = this.xml + xml.toXML({
      authorizationRequest: data
    });

    return new Promise(
      function (resolve, reject) {
        req(options, function (err, response, body) {
          tinythis.geterCode(err, body, tinythis, resolve, reject, function (body) {

            let checkout = {};
            for (const item in body.elements) {
              if (body.elements[item].name === "authorizationRequest") {
                for (const item2 in body.elements[item].elements) {

                  const tinyName = body.elements[item].elements[item2].name;
                  for (const item3 in body.elements[item].elements[item2].elements) {
                    checkout[tinyName] = body.elements[item].elements[item2].elements[item3].text;
                  }

                }
              };
            }

            checkout.codeURL = tinythis.uri2 + tinythis.version + '/authorization/request.jhtml?code=' + checkout.code;

            return checkout;

          });
        });
      });

  }


  // Get App Authorization
  checkAppAuthorization(type, code, code2) {

    const tinythis = this;

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/xml; charset=ISO-8859-1'
      }
    };

    // Notification Code
    if (type === "notificationCode") {
      options.uri = this.uri + this.version + "/authorizations/notifications/" + code + "?appId=" + this.appID + "&appKey=" + this.appKey;
    }

    // Authorization Code
    else if (type === "authorizationCode") {
      options.uri = this.uri + this.version + "/authorizations/" + code + "?appId=" + this.appID + "&appKey=" + this.appKey;
    }

    // Date
    else if (type === "date") {
      options.uri = this.uri + this.version + "/authorizations?appId=" + this.appID + "&appKey=" + this.appKey + "&initialDate=" + code + "&finalDate=" + code2;
    }

    // Date
    else if (type === "reference") {
      options.uri = this.uri + this.version + "/authorizations?appId=" + this.appID + "&appKey=" + this.appKey + "&reference=" + code;
    }

    return new Promise(
      function (resolve, reject) {
        req(options, function (err, response, body) {
          tinythis.convertXMLtoJSON(body, err, tinythis, resolve, reject);
        });
      });

  }

};

module.exports = pagseguro;
