import createHttpError from "http-errors";
import { User } from "../models/user.js";
import bcrypt from "bcrypt";
import { createSession, setSessionCookies } from "../services/auth.js";
import { Session } from "../models/session.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendMail.js";
import path from "node:path";
import fs from "node:fs/promises";
import Handlebars from "handlebars";



export const registerUser = async (req, res) => {
  const {email, password} = req.body;

  const existingUser = await User.findOne({email: email});
  if(existingUser) {
    throw createHttpError(400, "Email in use");
  }
// хешуємо пароль


  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  const newSession = await createSession(newUser._id);

// додаємо cookie на відповідь
  setSessionCookies(res, newSession);


  res.status(201).json(newUser);

};


export const loginUser = async (req, res) => {
  const {email, password} = req.body;
 const user = await User.findOne({email:email});
if(!user) {
throw createHttpError(401, "Invalid credentials");
}
const isValidPassword = await bcrypt.compare(password, user.password);
if(!isValidPassword) {
  throw createHttpError(401, "Invalid credentials");

}

await Session.deleteOne({userId: user._id});

const newSession = await createSession(user._id);
setSessionCookies(res, newSession);

res.status(200).json(user);





};

export const logoutUser = async (req,res) => {
  const {sessionId}= req.cookies;

  if(sessionId) {
    await Session.deleteOne({_id: sessionId});
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

  }
  res.status(204).end();
};

export const refreshUserSession = async (req, res) => {
  const {sessionId, refreshToken} = req.cookies;

  const session = await Session.findOne({
    _id: sessionId,
    refreshToken: refreshToken,
  });
  if(!session) {
    throw createHttpError(401, "Session not found");
  }
  const isRefreshTokenExpired = new Date() > new Date (session.refreshTokenValidUntil);
if(isRefreshTokenExpired) {
  throw createHttpError(401, "Session token expired");
}
await Session.deleteOne({ _id:sessionId, refreshToken});

const newSession = await createSession(session.userId);

setSessionCookies(res, newSession);
res.status(200).json({message: "Session refreshed"});

};



// Створимо контролер, який оброблятиме запит на зміну пароля:

export const requestResetEmail = async( req,res)=> {
  const {email} = req.body;
  const user = await User.findOne({email});
if(!user) {
  // anti user enumeration для безпеки не повертаємо помилку
  return res.status(200).json({
    message: 'If this email exists, a reset link has been sent',
  });
}

// Користувач є — генеруємо короткоживучий JWT і відправляємо лист

const resetToken = jwt.sign(
  {sub: user._id, email},
  process.env.JWT_SECRET,
  {expiresIn: "15m"}
);

// 1. Формуємо шлях до шаблона

const templatePass= path.resolve("src/templates/reset-password-email.html");
// 2. Читаємо шаблон

const templateSource = await fs.readFile(templatePass, "utf-8");

// 3. Готуємо шаблон до заповнення

const template = Handlebars.compile(templateSource);

// 4. Формуємо із шаблона HTML документ з динамічними даними

const html = template ({
  name: user.username,
  link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
});



try {
  await sendEmail({
    from: process.env.SMTP_FROM,
    to: email,
    // заголовок для листа
    subject: "Reset your password",
    // 5. Передаємо HTML у функцію надписання пошти
    html,
  });
} catch {
  throw createHttpError(500, 'Failed to send the email, please try again later.');

}

  res.status(200).json({
    message: 'If this email exists, a reset link has been sent',
  });
};


// Контролер виконує чотири ключові кроки:
//  перевіряє токен, знаходить користувача, хешує новий пароль і оновлює запис.

export const resetPassword = async (req, res) => {
  const {token, password} = req.body;
  // 1. Перевіряємо/декодуємо токен
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
     // Повертаємо помилку якщо проблема при декодуванні
     throw createHttpError(401, "Invalid or expired token");

  }

  // 2. Шукаємо користувача

  const user = await User.findOne({

      _id: payload.sub, email: payload.email

  });
  if(!user) {
    next(createHttpError(404, "User not found")
    );
    return;
  }


  // 3. Якщо користувач існує
  // створюємо новий пароль і оновлюємо користувача

  const hashedPassword = await bcrypt.hash(password,10);
  await User.updateOne (
    { _id: user._id},
    {password: hashedPassword}
  );
  // 4. Інвалідовуємо всі можливі попередні сесії користувача

  await Session.deleteMany({userId: user._id});


  // 5. Повертаємо успішну відповідь
  res.status(200).json({
    message: 'Password reset successfully. Please log in again.'
  });

};
