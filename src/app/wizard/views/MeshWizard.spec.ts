import { describe, expect, test } from '@jest/globals'
import { DOMWrapper, flushPromises, mount, VueWrapper } from '@vue/test-utils'

import MeshWizard from './MeshWizard.vue'
import { useMock } from '@/../jest/jest-setup-after-env'
import { useStore } from '@/utilities'

function renderComponent() {
  return mount(MeshWizard)
}

async function doStep(wrapper: VueWrapper<any>, nextButton: DOMWrapper<any>, enabledTestId: string, testIds: string[]): Promise<void> {
  // The next button is initially enabled because no data is enabled unless the user enables the configuration of the step.
  expect(nextButton.attributes('disabled')).toBe(undefined)

  // Let’s enable the configuration for the step.
  const enabledRadioButton = wrapper.find<HTMLInputElement>(`[data-testid="${enabledTestId}"]`)
  enabledRadioButton.element.checked = true
  await enabledRadioButton.trigger('change')
  await flushPromises()

  // Now the next button shouldn’t be enabled anymore because the user has to fill out the configuration.
  expect(nextButton.attributes('disabled')).toBe('')

  // Fill out all fields.
  for (const testId of testIds) {
    await wrapper.find(`[data-testid="${testId}"]`).setValue('fake-name')
  }

  // The next button should be enabled again.
  expect(nextButton.attributes('disabled')).toBe(undefined)

  await nextButton.trigger('click')
}

describe('MeshWizard', () => {
  const mock = useMock()
  const store = useStore()
  test('passes whole wizzard and render yaml', async () => {
    mock('/config', {}, (merge) => {
      return merge({
        body: {
          mode: 'global',
        },
      })
    })
    await store.dispatch('bootstrap')
    const wrapper = renderComponent()
    await flushPromises()

    const nextButton = wrapper.find('[data-testid="next-step-button"]')
    expect(nextButton.attributes('disabled')).toBe('')

    await wrapper.find('[data-testid="mesh-name"]').setValue('default')

    // 1 step
    await doStep(wrapper, nextButton, 'mesh-mtls-enabled', ['mesh-certificate-name'])

    // 2 Step
    await doStep(wrapper, nextButton, 'mesh-logging-enabled', ['mesh-logging-backend-name'])

    // 3 Step
    await doStep(wrapper, nextButton, 'mesh-tracing-enabled', ['mesh-tracing-backend-name', 'mesh-tracing-url'])

    // 4 Step
    await doStep(wrapper, nextButton, 'mesh-metrics-enabled', ['mesh-metrics-backend-name'])

    await flushPromises()

    expect(wrapper.element).toMatchSnapshot()

    // test that the cli command is correct depending
    // on which tab you clicked
    const kubeTab = wrapper.find('#kubernetes-tab')
    const uniCode = wrapper.find('[data-testid="universal"]')
    expect(uniCode.html()).toContain('kumactl')

    await kubeTab.trigger('click')

    const kubeCode = wrapper.find('[data-testid="kubernetes"]')
    expect(kubeCode.html()).toContain('kubectl')
  })
})
