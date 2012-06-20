Ext.namespace "gxp.plugins"
gxp.plugins.Login = Ext.extend(gxp.plugins.Tool,
  ptype: "gispro_josso_login"
  changeUserText: "Change user"
  loginText: "Login"

  jossoLoginUrl: 'http://localhost/josso/signon/login.do'
  jossoOutUrl: 'http://localhost/josso/signon/logout.do'

  init: ->
    gxp.plugins.Login.superclass.init.apply @, arguments
    @target.on 'ready', @setCookies, @
    #@setCookies()
      
    

  setCookies: ->
    @jossoAuthUrl = @target.authUrl + 'usernamePasswordLogin.do?josso_cmd=login&josso_back_to=&josso_username='+@target.username+'&josso_password='+@target.password
    #@jossoAuthUrl = @target.authUrl + 'usernamePasswordLogin.do?josso_cmd=login&josso_back_to=' + document.location.href + '&josso_username='+@target.username+'&josso_password='+@target.password
    if !@isCookiesSetted()
      if @target.authUrl
        document.cookie = 'guest=1; path=' + document.location.pathname
        #document.location.href = @jossoAuthUrl
        @addIframe( @jossoOutUrl, ->
          @addIframe( @jossoAuthUrl, ->
            if @target.jossoReload
              window.location.reload()
          ,
          @
          )
        ,
        @
        )

  addActions: ->
    @button = new Ext.Button(
      text: if @isCookiesSetted() && !@isGuest() then @changeUserText else @loginText
      handler: ->
        document.cookie = 'guest=; path=' + document.location.pathname + '; expires=Thu, 01 Jan 1970 00:00:00 GMT'


        appPathArr = document.location.pathname.split('/')
        appPathArr.splice(appPathArr.length-1,1)
        appPath = appPathArr.join '/'
        console.log appPath
        document.cookie = 'JOSSO_SESSIONID=; path=' + appPath + '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        document.cookie = 'JSESSIONID=; path=' + appPath + '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        @addIframe( @jossoOutUrl, ->
          document.location.href = @jossoLoginUrl + '?josso_back_to=' + document.location.href
        ,
        @
        )
      scope: @
    )
    gxp.plugins.Login.superclass.addActions.apply @, [ @button ]


  isCookiesSetted: ->
    document.cookie.match(/JOSSO_SESSIONID/)? && document.cookie.match(/JSESSIONID/)?

  isGuest: ->
    document.cookie.match(/guest/)?

  addIframe: (url, func, context)->
    el = document.createElement "iframe"
    el.style.display = 'none'
    el.onload = ->
      document.body.removeChild el
      if func?
        if context?
          func.apply context
        else
          func()
    el.src = url
    document.body.appendChild el

)
Ext.preg gxp.plugins.Login::ptype, gxp.plugins.Login
