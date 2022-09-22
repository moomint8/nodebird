const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {     // isNotLoggedIn 으로 로그인 안한 사람만 접근하도록
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });    // 이메일 중복 검사
        if (exUser) {
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(password, 12);   // 비밀번호 해시화
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');   // 메인 페이지로 돌려보내기
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            // 세션 쿠키를 브라우저로 보냄
            return res.redirect('/');
        });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

// passport 버전 변경으로 인해 문법 변화로 사용X
// router.get('/logout', isLoggedIn, (req, res) => {
//     req.logout();
//     req.session.destroy();
//     res.redirect('/');
// });

router.get("/logout", async (req, res, next) => {
    req.logout((err) => {
        req.session.destroy();
        if (err) {
            res.status(404).send("로그아웃 실패");
        } else {
            res.redirect("/");
        }
    });
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;