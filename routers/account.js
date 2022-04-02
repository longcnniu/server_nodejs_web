const express = require('express')
var router = express.Router()
//hash password
const argon2 = require('argon2');
//jwt
var jwt = require('jsonwebtoken')

//them thu vien
const nodemailer = require("nodemailer");

//DB models
const AccountModel = require('../models/account')
const OTPModel = require('../models/otp')

//check JWT
const middlewareCntroller = require("../controllers/middlewareController")

//express validator
const { check, validationResult } = require('express-validator');

//cookie-parser
const cookieParser = require('cookie-parser')


//===================================================================================================
router.get('/registration', middlewareCntroller.verifyTokenAndQAAuth, (req, res) => {
  const role = req.user.role
  return res.status(200).json({ success: true, role: role })
})

//registration user
router.post('/registration', async (req, res) => {
  const { email, password, role, firstName, lastName, Department } = req.body

  if (!email || !password || !role || !firstName || !lastName || !Department) {
    return res.status(400).json({ success: false, message: 'Missing' })
  }

  try {
    //check for existing user
    const checkEmail = await AccountModel.findOne({ email })

    if (checkEmail) {
      return res.status(400).json({ success: false, message: 'Email already exists' })
    }

    //All ok
    const hashPassword = await argon2.hash(password)
    const newUser = new AccountModel({ email, password: hashPassword, role, firstName, lastName, Department })
    await newUser.save()

    //Return token
    // const accessToken = await jwt.sign({ userId: newUser._id, role: newUser.role, email: newUser.email}, process.env.ACCESSTOKEN_MK, { expiresIn: "1d" })
    // const refreshToken = await jwt.sign({ userId: newUser._id, role: newUser.role, email: newUser.email}, process.env.REFRESTOKEN_MK, { expiresIn: "15m" })
    return res.status(200).json({ success: true, message: 'Created successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'loi server' })
  }
})
//===================================================================================================


router.post('/login', async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email and/or passwoed' })
    }

    try {
      //check for axisting user
      const user = await AccountModel.findOne({ email })
      if (!user) {
        return res.status(400).json({ success: false, message: 'Account does not exist' })
      }

      //username found
      const passwordValid = await argon2.verify(user.password, password)
      if (!passwordValid) {
        return res.status(400).json({ success: false, message: 'Incorrect password' })
      }

      //All good
      const accessToken = await jwt.sign({ userId: user._id, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` }, process.env.ACCESSTOKEN_MK, { expiresIn: "1d" })
      // const refreshToken = await jwt.sign({ userId: user._id, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` }, process.env.REFRESTOKEN_MK, { expiresIn: "15m" })
      // res.cookie("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   secure: false, //True when public server
      //   path:"/",
      //   sameSite: "strict"
      // })
      return res.status(200).json({ success: true, message: 'User logged in successfully', accessToken: accessToken})
    } catch (error) {
      return res.status(500).json({ success: false, message: 'loi server' })
    }
  })
//===================================================================================================
//Forgot password
router.get('/forgot-password', (req, res, next) => {
  res.json('page forgot password')
})

router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ success: false, message: 'Missing email' })
  }

  try {
    //check for axisting user
    const check = await AccountModel.findOne({ email })
    if (!check) {
      return res.status(400).json({ success: false, message: 'Account does not exist' })
    }
    //check OTP in DB exists
    const dataOTP = await OTPModel.findOne({ email })

    //có OTP cũ
    if (dataOTP) {
      let currentTime = new Date().getTime()
      let diff = dataOTP.expiresAt - currentTime
      if (diff > 0) {
        return res.json({ message: 'Sau 5p moi co the nhan email' })
      }
    }

    //Del OTP old
    await OTPModel.deleteOne({ email })

    //All ok
    const OTP = Math.floor((Math.random() * 100000) + 1)
    const expiresAt = new Date().getTime() + 300 * 1000
    const newOTP = new OTPModel({ email, OTP, expiresAt })
    await newOTP.save()

    //send email
    var user = process.env.EMAIL;
    var pass = process.env.PASS;
    var EmaiTo = email;

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass
      }
    });

    var mailOptions = {
      from: user,
      to: EmaiTo,
      subject: 'Sending Email using Node.js',
      html: `<head>
            <!--[if gte mso 9]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="x-apple-disable-message-reformatting">
            <!--[if !mso]><!-->
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <!--<![endif]-->
            <title></title>
          
            <style type="text/css">
              table,
              td {
                color: #000000;
              }
          
              a {
                color: #161a39;
                text-decoration: underline;
              }
          
              @media only screen and (min-width: 620px) {
                .u-row {
                  width: 600px !important;
                }
          
                .u-row .u-col {
                  vertical-align: top;
                }
          
                .u-row .u-col-50 {
                  width: 300px !important;
                }
          
                .u-row .u-col-100 {
                  width: 600px !important;
                }
          
              }
          
              @media (max-width: 620px) {
                .u-row-container {
                  max-width: 100% !important;
                  padding-left: 0px !important;
                  padding-right: 0px !important;
                }
          
                .u-row .u-col {
                  min-width: 320px !important;
                  max-width: 100% !important;
                  display: block !important;
                }
          
                .u-row {
                  width: calc(100% - 40px) !important;
                }
          
                .u-col {
                  width: 100% !important;
                }
          
                .u-col>div {
                  margin: 0 auto;
                }
              }
          
              body {
                margin: 0;
                padding: 0;
              }
          
              table,
              tr,
              td {
                vertical-align: top;
                border-collapse: collapse;
              }
          
              p {
                margin: 0;
              }
          
              .ie-container table,
              .mso-container table {
                table-layout: fixed;
              }
          
              * {
                line-height: inherit;
              }
          
              a[x-apple-data-detectors='true'] {
                color: inherit !important;
                text-decoration: none !important;
              }
            </style>
          
          
          
            <!--[if !mso]><!-->
            <link href="https://fonts.googleapis.com/css?family=Lato:400,700&display=swap" rel="stylesheet" type="text/css">
            <!--<![endif]-->
          
          </head>
          
          <body class="clean-body u_body"
            style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000">
            <!--[if IE]><div class="ie-container"><![endif]-->
            <!--[if mso]><div class="mso-container"><![endif]-->
            <table
              style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%"
              cellpadding="0" cellspacing="0">
              <tbody>
                <tr style="vertical-align: top">
                  <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #f9f9f9;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #f9f9f9;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:15px;font-family:'Lato',sans-serif;"
                                        align="left">
          
                                        <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #f9f9f9;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td
                                                style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                <span>&#160;</span>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:25px 10px;font-family:'Lato',sans-serif;"
                                        align="left">
          
          
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #161a39;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #161a39;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:35px 10px 10px;font-family:'Lato',sans-serif;"
                                        align="left"></td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 30px;font-family:'Lato',sans-serif;"
                                        align="left">
          
                                        <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 140%; text-align: center;"><span
                                              style="font-size: 28px; line-height: 39.2px; color: #ffffff; font-family: Lato, sans-serif;">Please
                                              reset your password </span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:40px 40px 30px;font-family:'Lato',sans-serif;"
                                        align="left">
          
                                        <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 140%;"><span
                                              style="font-size: 18px; line-height: 25.2px; color: #666666;">Hello,</span></p>
                                          <p style="font-size: 14px; line-height: 140%;">&nbsp;</p>
                                          <p style="font-size: 14px; line-height: 140%;"><span
                                              style="font-size: 18px; line-height: 25.2px; color: #666666;">We have sent you this
                                              email in response to your request to reset your password on company name.</span></p>
                                          <p style="font-size: 14px; line-height: 140%;">&nbsp;</p>
                                          <p style="font-size: 14px; line-height: 140%;"><span
                                              style="font-size: 18px; line-height: 25.2px; color: #666666;">To reset your
                                              password, please follow the link below: </span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:0px 40px;font-family:'Lato',sans-serif;"
                                        align="left">
          
                                        <div align="left">
                                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Lato',sans-serif;"><tr><td style="font-family:'Lato',sans-serif;" align="left"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:51px; v-text-anchor:middle; width:205px;" arcsize="2%" stroke="f" fillcolor="#18163a"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Lato',sans-serif;"><![endif]-->
                                          <div href="" target="_blank"
                                            style="box-sizing: border-box;display: inline-block;font-family:'Lato',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #18163a; border-radius: 1px;-webkit-border-radius: 1px; -moz-border-radius: 1px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;">
                                            <span style="display:block;padding:15px 40px;line-height:120%;"><span
                                                style="font-size: 18px; line-height: 21.6px;">${OTP}</span></span>
                                            </a>
                                            <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
                                          </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:40px 40px 30px;font-family:'Lato',sans-serif;"
                                        align="left">
          
                                        <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                          <p style="font-size: 14px; line-height: 140%;"><span
                                              style="color: #888888; font-size: 14px; line-height: 19.6px;"><em><span
                                                  style="font-size: 16px; line-height: 22.4px;">Please ignore this email if you
                                                  did not request a password change.</span></em></span><br /><span
                                              style="color: #888888; font-size: 14px; line-height: 19.6px;"><em><span
                                                  style="font-size: 16px; line-height: 22.4px;">&nbsp;</span></em></span></p>
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #18163a;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #18163a;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-50"
                            style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 20px 20px 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]><td align="center" width="300" style="width: 300px;padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-50"
                            style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px 0px 0px 20px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:25px 10px 10px;font-family:'Lato',sans-serif;"
                                        align="left">
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:5px 10px 10px;font-family:'Lato',sans-serif;"
                                        align="left"></td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: #f9f9f9">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #1c103b;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #f9f9f9;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #1c103b;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:15px;font-family:'Lato',sans-serif;"
                                        align="left">
          
                                        <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #1c103b;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                          <tbody>
                                            <tr style="vertical-align: top">
                                              <td
                                                style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                <span>&#160;</span>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
          
                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #f9f9f9;"><![endif]-->
          
                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                          <div class="u-col u-col-100"
                            style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                            <div style="width: 100% !important;">
                              <!--[if (!mso)&(!IE)]><!-->
                              <div
                                style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                <!--<![endif]-->
          
                                <table style="font-family:'Lato',sans-serif;" role="presentation" cellpadding="0" cellspacing="0"
                                  width="100%" border="0">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="overflow-wrap:break-word;word-break:break-word;padding:0px 40px 30px 20px;font-family:'Lato',sans-serif;"
                                        align="left">
          
                                        <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
          
                                        </div>
          
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
          
                                <!--[if (!mso)&(!IE)]><!-->
                              </div>
                              <!--<![endif]-->
                            </div>
                          </div>
                          <!--[if (mso)|(IE)]></td><![endif]-->
                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                        </div>
                      </div>
                    </div>
          
          
                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  </td>
                </tr>
              </tbody>
            </table>
            <!--[if mso]></div><![endif]-->
            <!--[if IE]></div><![endif]-->
          </body>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.status(200).json({ success: true, message: 'send Email successfully' })
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'loi server' + error })
  }
})

//check OTP and change password
router.post('/send-otp', async (req, res, next) => {
  const { email, otp, password } = req.body


  if (!email || !otp || !password) {
    return res.status(400).json({ success: false, message: 'Missing email and/or otp vs password' })
  }

  try {
    const dataOTP = await OTPModel.findOne({ email })

    let currentTime = new Date().getTime()
    let diff = dataOTP.expiresAt - currentTime
    //check OTP
    if (diff < 0) {
      await OTPModel.findOneAndDelete({ email })
      return res.status(400).json({ message: 'OTP Het hang', success: false })
    }
    if (otp != dataOTP.OTP) {
      console.log(dataOTP.OTP);
      return res.status(400).json({ message: 'Ma OTP Khong hop le', success: false })
    }

    //All good
    const hashPassword = await argon2.hash(password)
    await AccountModel.findOneAndUpdate({ email }, { password: hashPassword })
    await OTPModel.findOneAndDelete({ email })
    return res.status(200).json({ message: 'cap nha thanh cong', success: true })
    //return res.redirect('/login')

  } catch (error) {
    return res.status(500).json({ success: false, message: 'loi server' + error })
  }
})
//===================================================================================================
//Del Account
router.post('/del-account', middlewareCntroller.verifyTokenAndAdminAuth, async (req, res, next) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ success: false, message: 'Missing email' })
  }

  try {
    const user = await AccountModel.findOneAndDelete({ email })

    if (!user) {
      return res.status(400).json({ message: 'Email khong ton tai', success: false })
    }

    //All good
    res.status(200).json({ message: 'Del Thanh cong', success: true })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'loi server' + error })
  }
})

//===================================================================================================
//All Account
router.get('/all-user', middlewareCntroller.verifyTokenAndAdminAuth, async (req, res) => {

  try {
    const user = await AccountModel.find({ role: ['staff', 'qa-manager'] })

    if (user == '') {
      return res.status(200).json({ message: 'Chua co tai khoan', success: false })
    }

    res.status(200).json({ dataUsers: user, success: true })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'loi server' + error })
  }
})

//===================================================================================================
//All account for QA Manager
router.get('/all-user-qa', middlewareCntroller.verifyTokenAndQAAuth, async (req, res) => {

  try {
    const user = await AccountModel.find({ role: "staff" })

    if (user == '') {
      return res.status(200).json({ message: 'Chua co tai khoan', success: false })
    }

    res.status(200).json({ dataUsers: user, success: true })

  } catch (error) {
    return res.status(500).json({ success: false, message: 'loi server' + error })
  }
})

//===================================================================================================
//rereshToken

//===================================================================================================
//Get one user
router.get('/view-user/:id', middlewareCntroller.verifyTokenAndQAAuth, async (req, res) => {
  const id = req.params.id
  const roleAuth = req.user.role

  try {
    const data = await AccountModel.findById({ _id: id })

    if (!data) {
      return res.status(401).json({ success: false, message: 'tai khoan khong ton tai' })
    }

    return res.status(200).json({ success: true, data, roleAuth: roleAuth })
  } catch (error) {
    res.json(error)
  }

})

//updata user
router.put('/view-user/:id', middlewareCntroller.verifyTokenAndQAAuth, async (req, res) => {
  const id = req.params.id
  const role = req.body.role
  const email = req.body.email
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const Department = req.body.Department

  try {
    const data = await AccountModel.findByIdAndUpdate({ _id: `${id}` }, { email, role: role, Department, firstName, lastName })

    if (!data) {
      return res.status(401).json({ success: false, message: 'tai khoan khong ton tai' })
    }

    return res.status(200).json({ success: true, message: 'cap nhat thanh cong' })
  } catch (error) {
    res.json(error)
  }
})

//del User
router.delete('/view-user/:id', middlewareCntroller.verifyTokenAndQAAuth, async (req, res) => {
  const id = req.params.id
  try {
    const data = await AccountModel.findByIdAndDelete({ _id: `${id}` })

    if (!data) {
      return res.status(401).json({ success: false, message: 'tai khoan khong ton tai' })
    }

    return res.status(200).json({ success: true, message: 'xoa thanh cong' })
  } catch (error) {
    res.json(error)
  }
})

module.exports = router