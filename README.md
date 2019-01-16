<img src="https://raw.githubusercontent.com/dashersw/erste/master/resources/logo.png" height="180" alt="Erste" />

[![npm version](https://badge.fury.io/js/erste.svg)](https://badge.fury.io/js/erste)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/dashersw/erste.js/master/LICENSE)
[![API Reference Documentation](https://doxdox.org/images/badge-flat.svg)](http://doxdox.org/dashersw/erste/master)

# JavaScript view library for building performant hybrid mobile applications

**erste.js is a zero-hype view library with an attitude. It’s built for achieving maximum performance on mobile devices.**

## Features
- Lightweight, 7kb minified & gzipped
- No dependencies
- No magic—as declarative as it should be and no more
- No pitfalls—use good old DOM APIs, HTML5 & CSS3 to build modern apps
- Clean, structured and approachable API

## Overview

```js
// 1. Import erste,
import {Component} from 'erste';

// 2. Create your application,
class App extends Component {
    constructor() {
        super();
        this.counter = 0;
    }

    // 3. Arrange your view,
    template() {
        return `
        <div>
            <h1>${this.counter}</h1>
            <button class="increment">Increment</button>
            <button class="decrement">Decrement</button>
        </div>
        `;
    }
    // 4. Create your methods,
    increment() { this.$('h1').innerText = ++this.counter; }
    decrement() { this.$('h1').innerText = --this.counter; }

    // 5. Bind your events.
    get events() {
        return {
            'tap': {
                '.increment': this.increment,
                '.decrement': this.decrement
            }
        }
    }
}

// 6. Make your application run.
new App().render(document.body);
```

## Table of Contents

  * [Motivation](#motivation)
  * [Installation](#installation)
     * [Direct download](#direct-download)
     * [Using npm](#using-npm)
     * [Builds with Closure Compiler](#builds-with-closure-compiler)
  * [Example application](#example-application)
  * [Building your first application](#building-your-first-application)
     * [The root view](#the-root-view)
     * [DOM Events](#dom-events)
     * [How DOM event management works](#how-dom-event-management-works)
  * [Creating other components](#creating-other-components)
     * [Lifecycle management of components](#lifecycle-management-of-components)
        * [Option 1: Declarative](#option-1-declarative)
        * [Option 2: Imperative with erste.js API](#option-2-imperative-with-erstejs-api)
        * [Option 3: Imperative with DOM API](#option-3-imperative-with-dom-api)
  * [Creating master and detail views, or introducing the ViewManager](#creating-master-and-detail-views-or-introducing-the-viewmanager)
     * [Going back to the master view](#going-back-to-the-master-view)
     * [The back gesture](#the-back-gesture)
  * [Conclusion](#conclusion)
  * [License](#license)

## Motivation
Building applications should be straightforward and simple. Most of the frameworks used today fail hard at being simple, and they make the wrong compromises for marginal gains. A super declarative framework with a megabyte of size, one second boot time and thousands of questions on StackOverflow due to its obscure and unfamiliar API... is this familiar?

We as application developers don't need fancy features that are only good on the paper or in meetup talks. We need an easy-to-use, reasonable API that gets out of the way. The cognitive load for the framework used should ideally be 0. Good luck with that when you want to distinguish between '<' and '&'.

erste.js is a solemn approach to application development. It gives you the barebones to get started and doesn't try to steal the show from your application. It lets you focus on your own source code and gets out of the way.

## Installation
### Direct download
- [Minified version - 7kb gzipped](https://raw.githubusercontent.com/dashersw/erste.js/master/dist/erste.js)

### Using npm
```bash
npm install --save erste
```

### Builds with Closure Compiler
erste.js plays really well with Google Closure Compiler. It's actually built with Closure Compiler, so if you use Closure Compiler for your own application, you can also `goog.require` or `import` the source code of erste.js and use and compile it with your source code right away for minimal footprint and maximal performance.

## Example application

Head over to [erste.js-demo](https://github.com/dashersw/erste.js-demo) for an example Cordova application built with erste.js that showcases all the features of erste.js. It's fortunately not a to do app, but an almost real life multi-view app for displaying fan posters of popular tv shows. You can learn how to build and manage complex view hierarchies, handle user events and make use of the included tab bar, navigation bar, side bar, pull to refresh component and infinite scroll component. The repository also features a `Gulpfile.js` that includes common tasks for building the application with ES6 and transpiling it through Babel.

## Building your first application
GUI applications are built with component architectures in mind. This is not a latest trend but the way GUI architecture was defined over 40 years ago. So in erste.js, there is one single and simple building block — the `Component` class. Everything you see and touch in an application is a component in erste.js, but it also provides some special constructs that ease your development. The most imminent of these is the `View` class, which is the main class for presenting a full view — a container that fills the screen and hosts other components — with its own lifecycle.

### The root view
Every application starts with a root view. It is the first thing you put in your `<body>` tag, a single view that includes all of your application.

Write your root view by extending from the `View` class in erste.js;

`root-view.js`:

```js
import {View} from 'erste';

class RootView extends View {
    template() {
        return `
        <root-view>
            <h1>Hello world!</h1>
        </root-view>
        `;
    }
}
```

The only thing you need to override here is the `template` method. Note that templates are only markups in erste.js. They are not parsed for declarative syntax, so here the `<root-view>` is just a tag. Since we are targeting modern, HTML5-compatible browsers, you can actually use custom tags for distinguishable markup. Otherwise, you can just use plain `<div>`s. Actually, any element will do fine as a template, and a block element makes sense as the root view.

You now should insert this view into the DOM. There are two ways to do this, the simplest being;

`index.js`:

```js
import RootView from './root-view';

document.body.innerHTML = new RootView();
```

This simply inserts the template of your component to the body. A more involved alternative is to manually render the DOM element for the view as in;

`index.js`:

```
import RootView from './root-view';

new RootView().render();
```

Note that, the render method, when provided no arguments, renders this view directly into `document.body`. Alternatively, one may wish to pass in the desired host element as the first argument to the render method as in `new RootView().render(document.body);`

We will discuss the implications of both approaches in a further topic.

### DOM Events
Handling DOM events is completely automated in erste.js. We acknowledge that most of the bugs and problems arise due to poor handling of DOM events (especially when one forgets to remove them which leads to memory leaks). Moreover, manual DOM listeners hinder the performance of your application. Therefore, erste.js provides a complete event management system that fixes all of these problems for you in a declarative and extremely performant way.

erste.js also has a built-in gesture recognizer that provides touch events like `tap`, `longTap`, `swipe` and more.

Let's listen to the tap event on the button in our root view and do something meaningless with it;

`root-view.js`:

```js
import {View} from 'erste';

class RootView extends View {
    template() {
        return `
        <root-view>
            <h1>Hello world!</h1>
            <button>Tap me!</button>
        </root-view>
        `;
    }

    onTapButton() {
        this.$('h1').innerText = 'Thanks for the tap!';
    }

    get events() {
        return {
            'tap': {
                'button': this.onTapButton
            }
        }
    }
}
```

The first thing you'll notice here is the declaration of the `events` property. It's an object whose keys are event types and values are another object with keys corresponding to CSS selectors and values corresponding to event handlers.

Secondly, the manual DOM update. erste.js doesn't provide you with any data-binding functionality. Data-binding is, no matter what technique you employ, always a poor performer. Since the goal of erste.js is to be the most performant way of building apps, we decided against using declarative DOM updates and went for manual updates.

However, this brings about the question of efficacy, as the horrible problems due to poor handling of jQuery code is still fresh in some memories. There are indeed horrible ways of managing the DOM manually, and we want you to stick to the best practices without compromising convenience. Therefore we provide two helper methods, `$` and `$$`. As you might have already guessed, these are simple wrappers around `querySelector` and `querySelectorAll` DOM APIs. These calls are also scoped, meaning `this.$('button')` actually translates to `this.el.querySelector('button')` where `this.el` is the DOM element of the component. This is a very efficient and straightforward way of referencing DOM elements.

### How DOM event management works
erste.js provides a declarative method for managing DOM events, by heavily utilising event delegation. In erste.js, there's one global event handler for each DOM event type. When an event occurs, its global handler receives it and checks if there are any appropriate handlers defined in a component. If such a component is found, the event is forwarded to the designated handler. Although event management is delegated to global handlers on the body, event propagation still works as it's supposed to. This lets you use the regular event handling approach you are accustomed to from classical web development where parent components may listen to events that happen on their children.

## Creating other components
erste.js doesn't mess with your lifecycle management. Creation of additional views and components is strictly imperative, meaning you get to instantiate your views manually and whenever you want. We acknowledge that a key step in optimization of mobile apps is manually managing the instantiation and disposal of hefty components, so we simply leave it to you.

Let’s turn our simple button and label into a standalone component.

`button-with-label.js`:

```js
import {Component} from 'erste';

class ButtonWithLabel extends Component {
    template() {
        return `
        <button-with-label>
            <h1>Hello world!</h1>
            <button>Tap me!</button>
        </button-with-label>
        `;
    }

    onTapButton() {
        this.$('h1').innerText = 'Thanks for the tap!';
    }

    get events() {
        return {
            'tap': {
                'button': this.onTapButton
            }
        }
    }
}
```

We basically moved all the logic into a reusable component. An important thing to note here is, the `template` method should return a single HTML element. Therefore, we wrapped our `<h1>` and `<button>` in `<button-with-label>`.

Then the root view simply becomes;

`root-view.js`:

```js
import {View} from 'erste';
import ButtonWithLabel from './button-with-label';

class RootView extends View {
    constructor() {
        super();

        this.buttonWithLabel = new ButtonWithLabel();
    }

    template() {
        return `
        <root-view>
            ${this.buttonWithLabel}
        </root-view>
        `;
    }
}
```

Here is how declarative erste.js is; views and components can include other components by simply including them within the template literals.

### Lifecycle management of components
In this example we chose to instantiate the child component within the constructor of the `RootView`. While this is a very common scenario, for some reason we may want to defer the initialization of the child component.

#### Option 1: Declarative
We could create the component within the `template` method so that it would be created only when the view would be rendered. This wouldn’t be extremely maintainable, but could be a fair trade off for certain cases. Then the `template` method in `RootView` could look like this:

`root-view.js`:

```js
/* … previous code … */

    template() {
        this.buttonWithLabel = new ButtonWithLabel();

        return `
        <root-view>
            ${this.buttonWithLabel}
        </root-view>
        `;
    }
```

#### Option 2: Imperative with erste.js API
The child component may require its parent to be in the DOM when it’s instantiated. Under those circumstances, it would make sense to imperatively append the child into the parent after the parent is rendered into the DOM. In this case, the `RootView` would look like:

`root-view.js`:

```js
import {View} from 'erste';
import ButtonWithLabel from './button-with-label';

class RootView extends View {
    onAfterRender() {
        this.buttonWithLabel = new ButtonWithLabel();

        this.buttonWithLabel.render(this.el);
    }

    template() {
        return `<root-view></root-view>`;
    }
}
```

Of course, you could just as well instantiate `ButtonWithLabel` in `RootView`’s constructor and render it within `onAfterRender`.

#### Option 3: Imperative with DOM API
If you don’t like to remember custom `render` methods and such, you can also use the native `appendChild` DOM API.

In this case, the `RootView` would look like:

`root-view.js`:

```js
import {View} from 'erste';
import ButtonWithLabel from './button-with-label';

class RootView extends View {
    onAfterRender() {
        this.buttonWithLabel = new ButtonWithLabel();

        this.el.appendChild(this.buttonWithLabel.el);
    }

    template() {
        return `<root-view></root-view>`;
    }
}
```

Notice that here we need to access the `el` property of the `buttonWithLabel` component, which gives us the DOM element. Also, there is an implicit rendering happening when you access `el` for the first time. Since it creates a lot of buggy scenarios when `el` might be null, erste.js just assumes that whenever you want to refer to `el`, you actually want to have your component rendered. So if the component hasn’t been rendered before, for your convenience, erste.js first renders it into a DOM element before returning it to you.

## Creating master and detail views, or introducing the ViewManager
Mobile apps make extensive use of the master / detail view scheme, and it’s a first citizen in erste.js as well.

`ViewManager` is a class that orchestrates the introduction of detail views and manages a view hierarchy with history support for going back to previous views altogether with touch gestures.

Let’s revise our root view to make it a master view that displays a list of items, and introduce a detail view. In order to facilitate the internal view hierarchy, we have to make use of the `ViewManager` class. Let’s start by adapting our `index.js` for this;

`index.js`:

```js
import {ViewManager} from 'erste';
import RootView from './root-view';

var vm = new ViewManager();
var rootView = new RootView();
rootView.vm = vm;

vm.setCurrentView(rootView);
```

`setCurrentView` method renders the view into the root element of `vm`, which is the default one, the body, in this case. We then also hand `vm` onto `rootView`, because it will later utilise this view manager to show detail views.

Let’s first build our detail view.

`detail-view.js`:

```js
import {View} from 'erste';

class DetailView extends View {
    constructor(item) {
        super();

        this.item = item;
    }

    template() {
        return `
        <detail-view>
            <p>${this.item}</p>
        </detail-view>
        `;
    }
}
```

It simply receives an item in its constructor and prints it in the template.

Here is a sample master view implementation and how we can make use of our new detail view;

`root-view.js`:

```js
import {View} from 'erste';
import DetailView from './detail-view';

class RootView extends View {
    constructor() {
        super();

        this.items = [1, 2, 3];
    }

    onItemTap(e) {
        var targetIndex = e.targetEl.getAttribute('data-index');
        var item = this.items[targetIndex];

        var detailView = new DetailView(item);

        this.vm.pull(detailView);
    }

    template_item(item, index) {
        return `<div data-index=${index}>${item}</div>`;
    }

    template() {
        return `
        <root-view>
            ${this.items.map(this.template_item).join('')}
        </root-view>
        `;
    }

    get events() {
        return {
            'tap': {
                'div': this.onItemTap
            }
        };
    }
}
```

The most interesting bit here is how we get the information about the tapped item and how we create the detail view. Although there may be various implementations for this, we chose to embed the index of each item within its template. Then in the tap event handler, we fetch this index attribute and instantiate a `DetailView` with the corresponding item. The last thing is to tell the view manager to _pull_ this new detail view onto the screen.

Congratulations! Now you have a sample master / detail view application! Read on for more advanced use cases!

### Going back to the master view
In the simplest scenario, the detail view is a final view and a certain while after navigating to the detail view, the master view is disposed. This also prevents memory leaks by default. If you wish to keep the history of the previous views, the `pull` method accepts a second optional argument `opt_canGoBack` of type `boolean`. When passed in `true`, the view manager saves the first view in its history and doesn’t dispose it.

Later, you can call `vm.push()` whenever you want, and the view manager will go back to the master view, disposing the detail view.

### The back gesture
erste.js also features the swiping gesture from iOS for view navigation. You can drag from the left edge of the screen towards the right and it will reveal the master view below.

This gesture recognition is not enabled by default, and you need to enable it explicitly for the detail view. Modify `DetailView` constructor and set `supportsBackGesture` to `true`.

`detail-view.js`:

```js
    /* … previous code … */
    constructor(item) {
        super();

        this.item = item;

        this.supportsBackGesture = true;
    }
```

Now you will be able to navigate back to the original view with a swipe!

## Conclusion
erste.js has a lot more to offer in terms of application development. You can check out the various built-in components — such as the navigation bar, the tab bar and more — and learn how you can make use of the advanced features. Make sure to try the demo over at [erste.js-demo](https://github.com/dashersw/erste.js-demo) to see it all in action.

## License

MIT License

Copyright (c) 2017 Armagan Amcalar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
