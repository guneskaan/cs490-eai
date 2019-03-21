$(document).ready(function() {
    var loaded = false;
    $('#fullpage').fullpage({
        //Navigation
        menu: '#menu',
        lockAnchors: false,
        anchors: ['Cover', 'Reason', 'Story', 'Flight Delays At Major Airports Intro', 'Flight Delays At Major Airports', 'Airlines Performance Intro', 'Airline Performances', 'Reachable Destinations Intro', 'Reachable Destinations', 'About Us'],
        navigation: false,
        navigationPosition: 'right',
        navigationTooltips: ['Cover', 'Reason', 'Story', 'Flight Delays At Major Airports Intro', 'Flight Delays At Major Airports', 'Airlines Performance Intro', 'Airline Performances', 'Reachable Destinations Intro', 'Reachable Destinations', 'About Us'],
        showActiveTooltip: false,
        slidesNavigation: false,
        slidesNavPosition: 'bottom',

        //Scrolling
        css3: true,
        scrollingSpeed: 700,
        autoScrolling: false,
        fitToSection: false,
        fitToSectionDelay: 1000,
        scrollBar: true,
        easing: 'easeInOutCubic',
        easingcss3: 'ease',
        loopBottom: false,
        loopTop: false,
        loopHorizontal: true,
        continuousVertical: false,
        continuousHorizontal: false,
        scrollHorizontally: false,
        interlockedSlides: false,
        dragAndMove: false,
        offsetSections: false,
        resetSliders: false,
        fadingEffect: false,
        normalScrollElements: '#element1, .element2',
        scrollOverflow: false,
        scrollOverflowReset: false,
        scrollOverflowOptions: null,
        touchSensitivity: 15,
        normalScrollElementTouchThreshold: 5,
        bigSectionsDestination: null,

        //Accessibility
        keyboardScrolling: true,
        animateAnchor: true,
        recordHistory: true,

        //Design
        controlArrows: true,
        verticalCentered: true,
        sectionsColor: ['#a37136', '#44536e', '#8caa3b', '#fff3ec', '#b1cad4'],   // <<---- 在这里改section颜色y !!!!!!!!
        paddingTop: '3em',
        paddingBottom: '10px',
        fixedElements: '#header, .footer',
        responsiveWidth: 0,
        responsiveHeight: 0,
        responsiveSlides: false,
        parallax: false,
        parallaxOptions: {type: 'reveal', percentage: 62, property: 'translate'},

        //Custom selectors
        sectionSelector: '.section',
        slideSelector: '.slide',

        lazyLoading: true,

        //events
        onLeave: function (index, nextIndex, direction) {
        },
        afterLoad: function (anchorLink, index) {
            if (index === 2 && !loaded) {
                $('#txt').animateNumber(
                    {
                        number: 65953922,
                        color: 'green',
                        'font-size': '40px',
                        easing: 'easeOutCubic',
                        numberStep: comma_separator_number_step
                    },
                    5500
                );
                $('#txt2').animateNumber(
                    {
                        number: 125.48,
                        color: 'green',
                        'font-size': '40px',
                        easing: 'easeOutCubic',
                        numberStep: function(now, tween) {
                            var target = $(tween.elem);

                            target
                                .prop('number', now) // keep current prop value
                                .text(now.toFixed(2));
                        }
                    },
                    5500
                );
                sandTimerInit();
                loaded = true;
            }
            if (index === 3) {
                displayStory();
            }
        },
        afterRender: function () {
        },
        afterResize: function () {
        },
        afterResponsive: function (isResponsive) {
        },
        afterSlideLoad: function (anchorLink, index, slideAnchor, slideIndex) {
        },
        onSlideLeave: function (anchorLink, index, slideIndex, direction, nextSlideIndex) {
        }
    });

    // Prototype tutorial button
    $('prototype-tutorial').on('click', function () {
        
    })
});