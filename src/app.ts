import { customElement } from "@aurelia/runtime-html";
import { ExampleViewer } from "./components/example-viewer.js";
import { html } from "./html.js";
import type { IExample } from "./interfaces.js";

interface IExampleHeading {
  id: string;
  title: string;
  type: 'heading';
  desc: string;
}

type AureliaExample = (IExample | IExampleHeading) & { indent?: number };

@customElement({
  name: 'app',
  template: html`
<header>
  <a href="#/"><img id="logo" src="./images/aulogo.svg" /></a>
  <span>by examples</span>
</header>
<div style="display: flex;">
  <ul class="side-nav" style="flex-shrink: 0; align-self: flex-start;">
    <li repeat.for="example of examples"
      class="nav-item"
      heading.class="isHeading(example)"
      active.class="example === selectedExample">
      <a href="#\${example.id}" style="padding-left: calc(20px + \${(example.indent || 0) * 20}px);">\${example.title}</a></li>
  </ul>
  <main style="flex-grow: 1; min-width: 0;">
    <template repeat.for="example of examples">
      <section if.bind="isHeading(example)" class="section-heading" id.bind="example.id">
        <h2>\${example.title}</h2>
        <p>\${example.desc}</p>
      </section>
      <section else id.bind="example.id">
        <example-viewer example.bind="example"></example-viewer>
      </section>
    </template>
  </main>
</div>
<footer>
  <div>
    <h4>Resources</h4>
    <ul>
      <li><a href="docs/overview/what-is-aurelia">About</a></li>
      <li><a href="blog">Blog</a></li>
      <li><a href="http://eepurl.com/ces50j">Newsletter</a></li>
    </ul>
  </div>
  <div>
    <h4>Help</h4>
    <ul>
      <li><a href="https://discourse.aurelia.io/">Discourse</a></li>
      <li><a href="https://gitter.im/aurelia/Discuss">Gitter</a></li>
      <li><a href="https://stackoverflow.com/search?q=aurelia">Stack Overflow</a></li>
    </ul>
  </div>
  <div>
    <h4>Community</h4>
    <ul>
      <li><a href="https://github.com/aurelia">GitHub</a></li>
      <li><a href="https://twitter.com/aureliaeffect">Twitter</a></li>
      <li><a href="https://github.com/orgs/aurelia/people">Team</a></li>
    </ul>
  </div>
</footer>
  `,
  dependencies: [ExampleViewer],
})
export class App {
  examples: AureliaExample[] = [
    // hello world section
    {
      id: 'basic',
      type: 'heading',
      title: 'Aurelia examples',
      desc: 'Aurelia is a frontend JavaScript framework that is simple, powerful and unobtrusive.\n' +
        'It stays out of your way with a plain binding & observation system and an expressive & extensible templating.\n' +
        'Let\'s dive into Aurelia via hundred of examples.',
    },
    {
      id: 'hello-world',
      type: 'inline',
      title: 'Hello world',
      desc: 'A basic example of Aurelia template. Hello world!',
      indent: 1,
      code: {
        script: 'export class App {\n  message = "Hello world!";\n}',
        template: '<h1>${message}</h1>',
        styles: []
      }
    },
    // handling form
    {
      id: 'form-handling',
      type: 'heading',
      title: 'Form handling',
      desc:
        'It is not uncommon that at some point, your application will contain some form elements that ' +
        'provide the ability to allow user input. Whether they be select dropdowns, text inputs or buttons, ' +
        'Aurelia makes working with forms intuitive.',
    },
    {
      id: 'text-input',
      type: 'inline',
      indent: 1,
      title: 'input text',
      desc: 'A common element seen in forms is text <input>. Aurelia supports this via "value.bind"',
      code: {
        script: 'export class App {\n  message = "Hello world!";\n}',
        template: '<input value.bind="message" /><br>\n${message}',
        styles: [],
      }
    },
    {
      id: 'text-input',
      type: 'inline',
      indent: 1,
      title: 'input number',
      desc: 'Two way binding with a number <input/>, as string',
      code: {
        script: 'export class App {\n  count = 0;\n}',
        template: '<input type="number" value.bind="count" /><br>\ntype: ${typeof count} -- value: ${count}',
        styles: [],
      }
    },
    {
      id: 'text-input',
      type: 'inline',
      indent: 1,
      title: 'input number + valueAsNumber',
      desc: 'Two way binding with number <input/>, via "valueAsNumber" property, to reduce boiler plate converting string to number',
      code: {
        script: 'export class App {\n  a = 0;\n  b = 0;\n}',
        template: [
          '<b>Plus calculator</b>',
          'a: <input type="number" value-as-number.bind="a"/>\ntype: ${typeof a} -- value: ${a}',
          'b: <input type="number" value-as-number.bind="b"/>\ntype: ${typeof b} -- value: ${b}',
          '${a} + ${b} = ${a + b}'
        ].join('<br>\n'),
        styles: [],
      }
    },
    // conditional rendering
    {
      id: 'conditional-rendering',
      type: 'heading',
      title: 'Conditional rendering',
      desc: 'Change what is rendered or shown based on conditions in your code.',
    },
    {
      id: 'conditional-show-hide',
      type: 'link',
      title: 'With show/hide',
      desc:
        'An example of conditional rendering syntaxes in Aurelia with show/hide. ' +
        'Using this when it is desirable to hide/show an element without removing it from the document.',
      link: 'examples/conditional.show-hide.html',
      indent: 1,
      lazy: true,
    },
    {
      id: 'conditional-if-else',
      type: 'link',
      title: 'With if/else',
      desc:
        'Examples of conditional rendering syntaxes in Aurelia with if/else.' +
        'Using this when it is desirable to remove the elements when the condition is false/falsy',
      link: 'examples/conditional.if-else.html',
      indent: 1,
      lazy: true,
    },
    {
      id: 'conditional-switch',
      title: 'With switch',
      type: 'link',
      desc:
        'Examples of conditional rendering syntaxes in Aurelia with switch/case/default.' +
        'Using this when it is desirable to have the semantic of switch syntax',
      link: 'examples/conditional.switch.html',
      indent: 1,
      lazy: true,
    },
    {
      id: 'conditional-promise',
      title: 'With promise',
      type: 'link',
      desc: 
        'Examples of conditional rendering syntaxes in Aurelia with promise/pending/then/catch.' +
        'Using this when it is desirable to have the semantic of Promise in JavaScript, without intermediate view model code',
      link: 'examples/conditional.promise.html',
      indent: 1,
      lazy: true,
    },
  ];

  isHeading(example: IExample | IExampleHeading): example is IExampleHeading {
    return example.type === 'heading';
  }
}

class Footer {
  
}
