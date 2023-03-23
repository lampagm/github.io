    (function () {
    'use strict';
    function kulikcdn(object) {
      var network = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true
      });
      var last;
      var items = [];
      var html = $('<div><style>@media screen and (max-width: 2560px) {.kulikcdn .card--collection {width: 14.2%!important;} .kulikcdn .card__quality {right:0em;bottom:0em;font-size:.62em!important;left:inherit;} .kulikcdn .card__type {left:0em;top:0em;font-size:.62em!important;} }@media screen and (max-width: 2160px) {.kulikcdn .card--collection {width: 12.5%!important;} .kulikcdn .card__quality {right:0em;bottom:0em;font-size:.62em!important;left:inherit;} .kulikcdn .card__type {left:0em;top:0em;font-size:.62em!important;} }@media screen and (max-width: 1560px) {.kulikcdn .card--collection {width: 14.2%!important;}}@media screen and (max-width: 385px) {.kulikcdn .card--collection {width: 33.3%!important;}}@media screen and (max-width: 580px) {.kulikcdn .card--collection {width:25%!important;}</style></div>');
      var body = $('<div class="kulikcdn category-full"></div>');
      var wait_parse_video = false;
      var filter = new Lampa.Filter(object);
      var filter_sources = [];
      this.create = function () {
        var _this = this;
        Lampa.Background.immediately('');
        var btn = filter.render().find('.torrent-filter');
        filter.render().find('.torrent-filter').append('<div style="-webkit-align-self: center; -ms-flex-item-align: center; align-self: center; font-size: 1.2em;"><span>Сервер</span> <span class="last_cat" style="background-color: rgba(255, 255, 255, 0.3); padding: 0 0.5em; border-radius: 0.2em; font-size: 1.1em;"></span></div>');
        network["native"]('http://cdn.kulik.uz/cors.php?alserv=get', function (data) {
          filter_sources = data.channels;
          var last_url = Lampa.Storage.get('kulik_last_url', '');
          if (last_url) {
            filter_sources.forEach(function (a) {
              if (last_url.indexOf(a.playlist_url) >= 0) a.selected = true;
            });
          }
          if (!filter_sources.find(function (a) {
            return a.selected;
          })) filter_sources[1].selected = true;
          _this.build();
          _this.load(Lampa.Storage.get('kulik_last_url', '') || filter_sources.find(function (a) {
            return a.selected;
          }).playlist_url);
        }, function () {
          var empty = new Empty();
          html.append(empty.render());
          _this.start = empty.start;
          _this.activity.loader(false);
          _this.activity.toggle();
        });
        return this.render();
      };
      this.clear = function () {
        wait_parse_video = false;
        object.page = 1;
        last = false;
        items = [];
        body.empty();
        scroll.reset();
        this.activity.loader(false);
      };
      this.load = function (url) {
        var _this2 = this;
        this.activity.loader(true);
        network["native"](url, function (data) {
          Lampa.Storage.set('kulik_last_url', url);
          _this2.clear();
          _this2.append(data.list);
          _this2.updateFilter(data.menu);
          _this2.activity.toggle();
        }, function () {
          _this2.clear();
          var empty = Lampa.Template.get('list_empty');
          empty.css('padding-left', '0.75em');
          body.append(empty);

          _this2.activity.toggle();
        });
      };
      this.append = function (data) {
        var _this4 = this;
        data.forEach(function (element) {
          var card = Lampa.Template.get('card', {
            title: element.name
          });
          card.addClass('kulikcdn card--collection');
          card.find('.card__img').attr('src', element.picture);
          card.find('.card__age').remove();
          if (element.group) card.find('.card__view').append('<div class="card__quality"><div>' + element.group + '</div></div>');
          if (element.servcdn) card.find('.card__view').append('<div class="card__type">' + element.servcdn + '</div>');
          $('.last_cat').text(element.time);
          card.on('hover:focus', function () {
            last = card[0];
            scroll.update(card, true);
            var maxrow = Math.ceil(items.length / 7) - 1;
            //if (Math.ceil(items.indexOf(card) / 7) >= maxrow) _this4.next();
          });
          card.on('hover:enter', function () {
        var video = {
            title: element.name,
            url: element.video
        };
        
        
        var playlist = [],
        i = 1;
        data.forEach((function(a) {
            playlist.push({
                title: a.name,
                url: a.video
            }), i++
        })), video['playlist'] = playlist;
        Lampa.Player.play(video);
        Lampa.Player.playlist(playlist);
        
        Lampa.Player.opened() && "kulikcdn" == Lampa.Activity.active().component && (Lampa.Keypad.listener.destroy(), Lampa.Keypad.listener.follow("keydown", (function(e) {
            var a = e.code;
            Lampa.Player.opened() && (428 !== a && 34 !== a && 37 !== a || Lampa.PlayerPlaylist.prev(), 427 !== a && 33 !== a && 39 !== a || Lampa.PlayerPlaylist.next())
        })));
        
			
    });
          body.append(card);
          items.push(card);
        });
      };
      this.biuldFilter = function () {
        var _this5 = this;
        filter.render().removeClass('scroll--nopadding').find('.filter--search,.filter--sort').remove();
        filter.render().find('.selector').on('hover:focus', function (e) {
          last = e.target;
        });
        filter.onSelect = function (type, a, b) {
          if (type == 'filter') {
            if (b) _this5.load(b.playlist_url);
            setTimeout(Lampa.Select.close, 10);
          }
        };
        filter.onBack = function () {
          Lampa.Controller.toggle('content');
        };
        this.updateFilter([]);
      };
      this.updateFilter = function (data) {
        var filter_items = [{
          title: Lampa.Lang.translate('settings_kutv_serv'),
          subtitle: filter_sources.find(function (a) {
            return a.selected;
          }).title,
          items: filter_sources
        }];
        if (data) {
          data.forEach(function (menu) {
            if (!menu.search_on) {
              var title = menu.title.split(':')[0];
              var subti = menu.title.split(':')[1].trim();
              if (menu.submenu) {
                menu.submenu.forEach(function (a) {
                  if (a.playlist_url == Lampa.Storage.get('kulik_last_url', '')) {
                    a.selected = true;
                    subti = a.title;
                  }
                });
              }
              filter_items.push({
                title: title,
                subtitle: subti,
                items: menu.submenu
              });
            }
          });
        }
        filter.set('filter', filter_items);
        this.updateFilterSelected();
      };
      this.updateFilterSelected = function () {
        filter.chosen('filter', filter.get('filter').map(function (a) {
          return a.title + ': ' + a.subtitle;
        }));
      };
      this.build = function () {
        scroll.minus();
        html.append(scroll.render());
        this.biuldFilter();
        scroll.append(filter.render());
        scroll.append(body);
      };
      this.start = function () {
        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(scroll.render());
            Lampa.Controller.collectionFocus(last || false, scroll.render());
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          right: function right() {
            if (Navigator.canmove('right')) Navigator.move('right');else filter.show(Lampa.Lang.translate('title_filter'), 'filter');
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: function back() {
            Lampa.Activity.backward();
          }
        });
        Lampa.Controller.toggle('content');
      };
      this.pause = function () {};
      this.stop = function () {};
      this.render = function () {
        return html;
      };
      this.destroy = function () {
        network.clear();
        scroll.destroy();
        html.remove();
        items = [];
      };
    }
    function startPlugin() {
      window.plugin_kulikcdn_ready = true;
        Lampa.Component.add('kulikcdn', kulikcdn);
    		if (!Lampa.Lang) {
    			var lang_data = {};
    			Lampa.Lang = {
    				add: function (data) {
    					lang_data = data;
    				},
    				translate: function (key) {
    					return lang_data[key] ? lang_data[key].ru : key;
    				}
    			}
    		}
	      Lampa.Lang.add({
          settings_kutv_serv: {
            ru: 'Сервер',
            en: 'Server'
          },
          player_playlisttv: {
            ru: 'Список каналов',
            en: 'Channels'
          }
        });
        Lampa.Template.add('kulikcdn', "<style>.kulikcdn--filter-button{background-color:#393a44;padding:.7em 1em;font-size:1.1em;-webkit-border-radius:.2em;-moz-border-radius:.2em;border-radius:.2em;font-weight:300;margin-right:1em;display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;} .kulikcdn--filter-button > div{        margin-left:.5em;} .kulikcdn--filter-button.focus{background-color:#d81f26;}</style>");
        $('body').append(Lampa.Template.get('kulikcdn', {}, true));
      function add() {
        var button = $('<li class="menu__item selector" data-action="kulikcdn"><div class="menu__ico"><img src="http://cdn.kulik.uz/pics/retro-tv.png"></div><div class="menu__text">\u041A\u0443\u043B\u0438\u043A\u041A\u0430\u043D\u0430\u043B\u044B</div></li>');
        button.on('hover:enter', function () {
          Lampa.Activity.push({
            url: '',
            title: 'КуликКаналы',
            component: 'kulikcdn',
            page: 1
          });
        });
        $('.menu .menu__list').eq(0).append(button);
      }
      if (window.appready) add();else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type == 'ready') add();
        });
      }
    }
    if (!window.plugin_kulikcdn_ready) startPlugin();
})();