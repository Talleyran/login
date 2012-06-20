
Ext.namespace("gxp.plugins");

gxp.plugins.Login = Ext.extend(gxp.plugins.Tool, {
  ptype: "gispro_josso_login",
  changeUserText: "Change user",
  loginText: "Login",
  jossoLoginUrl: 'http://localhost/josso/signon/login.do',
  jossoOutUrl: 'http://localhost/josso/signon/logout.do',
  init: function() {
    gxp.plugins.Login.superclass.init.apply(this, arguments);
    return this.target.on('ready', this.setCookies, this);
  },
  setCookies: function() {
    this.jossoAuthUrl = this.target.authUrl + 'usernamePasswordLogin.do?josso_cmd=login&josso_back_to=&josso_username=' + this.target.username + '&josso_password=' + this.target.password;
    if (!this.isCookiesSetted()) {
      if (this.target.authUrl) {
        document.cookie = 'guest=1; path=' + document.location.pathname;
        return this.addIframe(this.jossoOutUrl, function() {
          return this.addIframe(this.jossoAuthUrl, function() {
            if (this.target.jossoReload) return window.location.reload();
          }, this);
        }, this);
      }
    }
  },
  addActions: function() {
    this.button = new Ext.Button({
      text: this.isCookiesSetted() && !this.isGuest() ? this.changeUserText : this.loginText,
      handler: function() {
        var appPath, appPathArr;
        document.cookie = 'guest=; path=' + document.location.pathname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        appPathArr = document.location.pathname.split('/');
        appPathArr.splice(appPathArr.length - 1, 1);
        appPath = appPathArr.join('/');
        console.log(appPath);
        document.cookie = 'JOSSO_SESSIONID=; path=' + appPath + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'JSESSIONID=; path=' + appPath + '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        return this.addIframe(this.jossoOutUrl, function() {
          return document.location.href = this.jossoLoginUrl + '?josso_back_to=' + document.location.href;
        }, this);
      },
      scope: this
    });
    return gxp.plugins.Login.superclass.addActions.apply(this, [this.button]);
  },
  isCookiesSetted: function() {
    return (document.cookie.match(/JOSSO_SESSIONID/) != null) && (document.cookie.match(/JSESSIONID/) != null);
  },
  isGuest: function() {
    return document.cookie.match(/guest/) != null;
  },
  addIframe: function(url, func, context) {
    var el;
    el = document.createElement("iframe");
    el.style.display = 'none';
    el.onload = function() {
      document.body.removeChild(el);
      if (func != null) {
        if (context != null) {
          return func.apply(context);
        } else {
          return func();
        }
      }
    };
    el.src = url;
    return document.body.appendChild(el);
  }
});

Ext.preg(gxp.plugins.Login.prototype.ptype, gxp.plugins.Login);
