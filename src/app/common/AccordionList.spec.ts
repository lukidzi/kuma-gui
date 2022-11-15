import { mount } from '@vue/test-utils'

import AccordionList from './AccordionList.vue'
import AccordionItem from './AccordionItem.vue'

function renderComponent(props = {}) {
  return mount(AccordionList, {
    global: {
      stubs: {
        AccordionItem,
      },
    },
    slots: {
      default: [
        `
          <AccordionItem>
            <template #accordion-header>
              Header 1
            </template>

            <template #accordion-content>
              Content 1
            </template>
          </AccordionItem>
        `,
        `
          <AccordionItem>
            <template #accordion-header>
              Header 2
            </template>

            <template #accordion-content>
              Content 2
            </template>
          </AccordionItem>
        `,
      ],
    },
    props,
  })
}

describe('AccordionList.vue', () => {
  it('renders snapshot at the beginning', () => {
    const wrapper = renderComponent()

    expect(wrapper.element).toMatchSnapshot()
  })

  it('renders with opened second panel and switch opened panel on click', async () => {
    const wrapper = renderComponent({ initiallyOpen: 1 })

    expect(wrapper.find('[data-testid="accordion-item-content"]').html()).toContain('Content 2')

    const button = wrapper.find('[data-testid="accordion-item-button"]')
    expect(button.html()).toContain('Header 1')
    await button.trigger('click')

    expect(wrapper.find('[data-testid="accordion-item-content"]').html()).toContain('Content 1')
  })

  it('renders initally two opened accordion', async () => {
    const wrapper = renderComponent({
      initiallyOpen: [0, 1],
      multipleOpen: true,
    })

    expect(wrapper.findAll('[data-testid="accordion-item-content"]').length).toBe(2)
  })

  it('renders initally two closed accordions and open it', async () => {
    const wrapper = renderComponent({ multipleOpen: true })

    expect(wrapper.findAll('[data-testid="accordion-item-content"]').length).toBe(0)
    const buttons = wrapper.findAll('[data-testid="accordion-item-button"]')
    for (const button of buttons) {
      await button.trigger('click')
    }

    expect(wrapper.findAll('[data-testid="accordion-item-content"]').length).toBe(2)
  })
})
