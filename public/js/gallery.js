var Gallery = function () {
  "use strict";

  function Construct(params) {
    if (!(this instanceof Construct)) {
      return new Construct(params);
    }

    this.init.apply(this, params);
  }

  Construct.prototype = Object.create(ReasanikBase());

  Construct.prototype.constructor = Construct;

  Construct.prototype.pluginName = "Gallery";

  Construct.prototype.init = function (params) {
    var _ = this;

    params = _.extend(
      {
        rootFolder: "img/",
        name: false,
        items: false,
        categories: false,
        showCategory: false,
        lightBoxID: false,
        showMenu: true,
        childClass: "photo_block-wrap",
      },
      params,
    );

    if (!params.name || !params.categories) {
      _.setErrorMessage(_.pluginName);
      return false;
    }

    _.name = params.name;
    _.rootFolder = params.rootFolder + _.name;
    _.childClass = params.childClass;
    _.categories = [{ title: "all", items: [] }].concat(params.categories);
    _.showCategory = params.showCategory;
    _.showMenu = params.showMenu;

    var lightBoxID = _.name + "-" + params.lightBoxID;

    params = null;

    _.lightBox = document.getElementById(lightBoxID);

    _.iter = 0;
    _.itemsCount;
    _.intervalID = 0;
    _.startedAnimation = false;
    _.shownItems;
    _.dataSrcName = "data-src";
    _.slideCategoryPrefix = "gallery_category_";
    _.curCategory = 0;
    _.sliderID = _.name + "-slider-demonstration";
    _.prevID = _.name + "-slider-prev";
    _.nextID = _.name + "-slider-next";
    _.$slider;
    _.$prev;
    _.$next;
    _.enableArrows = true;
    _.existEmptySlide = false;

    // countInRow = 0;
    // elemWidth;
    // marginLeft;
    // marginEvenRow;
    // oldColClass;
    // evenRowsExist;

    _.RestructItems = RestructRhombuses({
      selector: "#" + _.name + "-blocks.display_rhombuses",
      childElem: "." + _.childClass,
      wait: true,
      maxCols: 4,
    });

    if (_.showMenu) {
      _.createMenu();
    }

    if (_.lightBox) {
      var closeID = _.name + "-slider-close";
      var sliderTempInnerHTML = "";

      _.categories.forEach(function (category, catIndex) {
        category.items.forEach(function (item, itemIndex) {
          sliderTempInnerHTML += _.slideTemplate(catIndex, item, itemIndex);
        });
      });

      document.getElementById(_.sliderID).innerHTML = sliderTempInnerHTML;

      _.$slider = $("#" + _.sliderID);
      _.$prev = $("#" + _.prevID);
      _.$next = $("#" + _.nextID);

      _.$slider.slick({
        accessibility: false,
        arrows: false,
        dots: false,
        draggable: false,
      });

      _.$prev.on("click", function () {
        _.arrowOn(false);
      });
      _.$next.on("click", function () {
        _.arrowOn(true);
      });

      document.getElementById(closeID).addEventListener("click", function (e) {
        e.preventDefault();
        _.lightBox.classList.add("lightbox--hidden");
      });

      document.getElementById(_.name + "-blocks").addEventListener("click", function (event) {
        event.preventDefault();

        var elem = event.target;
        var tagName = elem.tagName.toLowerCase();
        var index;

        if (tagName !== "a" && elem.parentNode.tagName.toLowerCase() !== "a") {
          return;
        }

        // if (tagName === 'a' || elem.parentNode.tagName.toLowerCase() === 'a')
        // {
        if (tagName != "a") {
          elem = elem.parentNode;
        }

        index = +elem.getAttribute("data-index");
        $(_.$slider).slick("slickGoTo", index);
        _.lightBox.classList.remove("lightbox--hidden");
        // }
      });
    }

    _.eventFuncs = [
      {
        e: "resize",
        f: function () {
          _.showItems();
        },
      },
      {
        e: "scroll",
        f: function () {
          _.showItems();
        },
      },
      {
        e: "orientationChange",
        f: function () {
          _.showItems();
        },
      },
    ];

    for (var i = 0; i < _.eventFuncs.length; i++) {
      window.addEventListener(_.eventFuncs[i].e, _.eventFuncs[i].f);
    }

    _.showItems();
  };

  Construct.prototype.arrowOn = function (isNext) {
    var _ = this;
    if (_.enableArrows) {
      $(_.$slider).slick(isNext ? "slickNext" : "slickPrev");
    }
  };

  Construct.prototype.switchArrows = function (enable) {
    var _ = this;
    var styleProperty = "opacity";
    var enableStyleValue = 1;
    var disableStyleValue = 0.5;

    _.enableArrows = enable;

    if (_.enableArrows) {
      _.$prev.css(styleProperty, enableStyleValue);
      _.$next.css(styleProperty, enableStyleValue);
    } else {
      _.$prev.css(styleProperty, disableStyleValue);
      _.$next.css(styleProperty, disableStyleValue);
    }
  };

  Construct.prototype.slideTemplate = function (catIndex, item, itemIndex) {
    var _ = this;
    var isEmpty = catIndex < 0;
    var emptyTitle = "EMPTY SLIDE";

    return (
      '<div class="' +
      _.slideCategoryPrefix +
      (isEmpty ? 0 : catIndex) +
      '"><div class="img_wrap ' +
      _.name +
      '_lightbox-img_wrap">' +
      (isEmpty
        ? '<img class="img_wrap-img blog-img" src="" alt="' + emptyTitle + '" />'
        : _.getPicture("img_wrap-img blog-img", catIndex, itemIndex)) +
      '</div><div class="lightbox-desc_container ' +
      _.name +
      '_lightbox-desc_container"><p>' +
      (isEmpty ? emptyTitle : item.description) +
      "</p></div></div>"
    );
  };

  Construct.prototype.getImagePath = function (catIndex, breakpoint, itemIndex) {
    var _ = this;
    var category = !catIndex
      ? _.categories[catIndex].items[itemIndex].category
      : _.categories[catIndex].title;
    var imageIndex = !catIndex ? _.categories[catIndex].items[itemIndex].image : itemIndex;
    return _.rootFolder + "/" + category + "/" + breakpoint + "/" + (imageIndex + 1) + ".jpg";
  };

  Construct.prototype.getPictureSources = function (catIndex, itemIndex) {
    var _ = this;
    var breakpoints = [
      { path: "d", value: 1170 },
      { path: "t", value: 768 },
    ];
    var result = "";

    breakpoints.forEach(function (breakpoint) {
      result +=
        '<source srcset="' +
        _.getImagePath(catIndex, breakpoint.path, itemIndex) +
        '" srcset="" media="(min-width: ' +
        breakpoint.value +
        'px)">';
    });

    return result;
  };

  Construct.prototype.getPicture = function (classes, catIndex, itemIndex) {
    var _ = this;
    return (
      "<picture>" +
      _.getPictureSources(catIndex, itemIndex) +
      '<img class="' +
      classes +
      '" src="' +
      _.getImagePath(catIndex, "m", itemIndex) +
      '" alt="' +
      _.categories[catIndex].items[itemIndex].title +
      '"></picture>'
    );
  };

  Construct.prototype.showItems = function () {
    var _ = this;

    if (!_.startedAnimation && _.isVisibleElem(_.name)) {
      _.setRhombusesByCategory();

      for (var i = 0, len = _.eventFuncs.length; i < len; i++) {
        window.removeEventListener(_.eventFuncs[i].e, _.eventFuncs[i].f);
      }
    }
  };

  Construct.prototype.getItemsByCategory = function () {
    var _ = this;

    if (!_.curCategory && !_.categories[0].items.length) {
      _.categories.forEach(function (category, catIndex) {
        if (catIndex > 0) {
          category.items.forEach(function (item, itemIndex) {
            var itemClone = {
              title: item.title,
              description: item.description,
              category: category.title,
              image: itemIndex,
            };
            _.categories[0].items.push(itemClone);
          });
        }
      });
    }

    return _.categories[_.curCategory].items;
  };

  Construct.prototype.setRhombusesByCategory = function () {
    var _ = this;

    _.parentElem = document.getElementById(_.name + "-blocks");

    var menuItems = document.querySelectorAll("#" + _.name + "-menu a");
    var tempInnerHTML = "";
    var i, len;

    _.startedAnimation = true;
    _.iter = 0;
    _.itemsCount = 0;
    _.parentElem.innerHTML = "";

    _.getItemsByCategory().forEach(function (item, itemIndex) {
      tempInnerHTML +=
        '<div class="' +
        _.childClass +
        '"><div class="photo_block-frame"><div class="photo_block-rhombus">' +
        _.getPicture("photo_block-img", _.curCategory, itemIndex) +
        '<div class="photo_block-foreground"></div><h3 class="section-title photo_block-title">' +
        item.title +
        "</h3></div></div>";

      if (_.showCategory) {
        tempInnerHTML +=
          '<div class="rhombus_wrap rhombus_wrap--btn rhombus_wrap--category photo_block-category"><div class="rhombus_wrap-rhombus"></div></div>';
      }

      tempInnerHTML +=
        '<a href="#" data-index="' +
        itemIndex +
        '" class="rhombus_wrap rhombus_wrap--btn rhombus_wrap--more photo_block-more"><div class="rhombus_wrap-rhombus"></div></a></div>';

      _.itemsCount++;
    });

    if (!tempInnerHTML) {
      tempInnerHTML = "К сожалению в данной категории нет фотографий!";
    }

    _.createHelpArray();
    _.parentElem.innerHTML = tempInnerHTML;

    len = menuItems.length;

    if (len) {
      for (i = 0; i < len; i++) {
        menuItems[i].classList.remove("active");
      }

      menuItems[_.curCategory].classList.add("active");
    }

    _.RestructItems.run(true);

    if (_.itemsCount) {
      if (_.intervalID) {
        clearInterval(_.intervalID);
        _.intervalID = 0;
      }

      _.intervalID = setInterval(function () {
        _.randomShowing();
      }, 170);
    }
  };

  Construct.prototype.createMenu = function () {
    var _ = this;

    var container = document.createElement("div");
    var menu = document.createElement("ul");
    var tempInnerHTML = "";

    container.className = "menu-container section-flex_container";

    menu.id = _.name + "-menu";
    menu.className = "hor_menu " + _.name + "-menu";

    _.categories.forEach(function (category, index) {
      tempInnerHTML += '<li class="list-item"><a class="list-link';

      if (!index) {
        tempInnerHTML += " active";
      }

      tempInnerHTML += '" href="#" data-index="' + index + '">' + category.title + "</a></li>";
    });

    // tempInnerHTML += '<li id="grid-switcher-squares"><a data-display="squares" href="#"></a></li>';
    // tempInnerHTML += '<li id="grid-switcher-rhombuses"><a class="active" data-display="rhombuses" href="#"></a></li>';

    menu.innerHTML = tempInnerHTML;

    menu.addEventListener("click", function (event) {
      var elem = event.target;
      // var display;

      if (elem.tagName != "A") {
        return;
      }

      event.preventDefault();

      if (elem.hasAttribute("data-index")) {
        var selector;

        _.curCategory = +elem.getAttribute("data-index");
        _.setRhombusesByCategory();

        $(_.$slider).slick("slickUnfilter");
        _.switchArrows(true);

        if (_.curCategory > 0) {
          selector = "." + _.slideCategoryPrefix + _.curCategory;

          if (_.categories[_.curCategory].items.length == 1) {
            if (!_.existEmptySlide) {
              $(_.$slider).slick("slickAdd", _.slideTemplate(-1));
              _.existEmptySlide = true;
            }

            selector += ", ." + _.slideCategoryPrefix + "0";
            _.switchArrows(false);
          }
        } else {
          selector = ":not(." + _.slideCategoryPrefix + "0)";
        }

        $(_.$slider).slick("slickFilter", selector).slick("refresh");
      }
      // else if (elem.hasAttribute('data-display'))
      // {
      // 	display = elem.getAttribute('data-display');
      // 	console.log(_.parentElem);

      // 	_.parentElem.classList.remove('display_rhombuses');
      // 	_.parentElem.classList.remove('display-squares');
      // 	_.parentElem.classList.add('display-' + display);
      // }
    });

    container.appendChild(menu);
    document
      .querySelector("#" + _.name + " .section-container")
      .insertBefore(container, document.getElementById(_.name + "-blocks"));
  };

  Construct.prototype.createHelpArray = function () {
    var _ = this;
    _.shownItems = _.fillArray(new Array(_.itemsCount), 0);
  };

  Construct.prototype.randomShowing = function () {
    var _ = this;
    var elem;
    var index;

    do {
      index = parseInt(Math.random() * _.itemsCount);
    } while (_.shownItems[index]);

    elem = document.querySelector(
      "#" + _.name + "-blocks ." + _.childClass + ":nth-child(" + (index + 1) + ")",
    );

    elem.style.opacity = 1;
    _.shownItems[index] = 1;
    _.iter++;

    if (_.iter >= _.itemsCount) {
      clearInterval(_.intervalID);
      _.intervalID = 0;
    }
  };

  return Construct(arguments);
};
