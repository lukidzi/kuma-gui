<template>
  <WizardTitleBar class="mb-6">
    <template #title>
      {{ i18n.t('zones.create.pageTitle') }}
    </template>

    <template #actions>
      <KButton
        appearance="outline"
        :to="{ name: 'zone-list-view' }"
      >
        {{ i18n.t('zones.form.exit') }}
      </KButton>
    </template>
  </WizardTitleBar>

  <div class="form-content">
    <h1>{{ i18n.t('zones.create.pageTitle') }}</h1>

    <div class="form-wrapper mt-4">
      <div>
        <KLabel for="zone-name">
          {{ i18n.t('zones.form.nameLabel') }} *
        </KLabel>

        <KInput
          id="zone-name"
          v-model="name"
          type="text"
          name="zone-name"
          data-testid="name-input"
          :disabled="zone !== null"
        />
      </div>

      <KButton
        appearance="creation"
        :icon="isCreatingZone ? 'spinner' : 'plus'"
        :disabled="!canBeSaved || isCreatingZone || zone !== null"
        data-testid="create-zone-button"
        @click="createZone"
      >
        {{ i18n.t('zones.form.createZoneButtonLabel') }}
      </KButton>
    </div>

    <div
      v-if="zone !== null"
      class="form-wrapper mt-4"
    >
      <div>
        <span class="k-input-label">
          {{ i18n.t('zones.form.environmentLabel') }} *
        </span>

        <div class="radio-button-group">
          <KRadio
            id="zone-environment-universal"
            v-model="environment"
            selected-value="universal"
            name="zone-environment"
            data-testid="environment-universal-radio-button"
          >
            {{ i18n.t('zones.form.universalLabel') }}
          </KRadio>

          <KRadio
            id="zone-environment-kubernetes"
            v-model="environment"
            selected-value="kubernetes"
            name="zone-environment"
            data-testid="environment-kubernetes-radio-button"
          >
            {{ i18n.t('zones.form.kubernetesLabel') }}
          </KRadio>
        </div>
      </div>

      <template v-if="environment === 'kubernetes'">
        <div>
          <span class="k-input-label">
            {{ i18n.t('zones.form.zoneIngressLabel') }} *
          </span>

          <div class="radio-button-group">
            <KInputSwitch
              id="zone-ingress-enabled"
              v-model="zoneIngressEnabled"
              data-testid="ingress-input-switch"
            >
              <template #label>
                {{ i18n.t('zones.form.zoneIngressEnabledLabel') }}
              </template>
            </KInputSwitch>
          </div>
        </div>

        <div>
          <span class="k-input-label">
            {{ i18n.t('zones.form.zoneEgressLabel') }} *
          </span>

          <div class="radio-button-group">
            <KInputSwitch
              id="zone-egress-enabled"
              v-model="zoneEgressEnabled"
              data-testid="egress-input-switch"
            >
              <template #label>
                {{ i18n.t('zones.form.zoneEgressEnabledLabel') }}
              </template>
            </KInputSwitch>
          </div>
        </div>
      </template>

      <h2 class="mt-6">
        {{ i18n.t('zones.form.connectZone') }}
      </h2>

      <ZoneCreateUniversalInstructions
        v-if="environment === 'universal'"
        :zone-name="name"
        :token="token"
        :base64-encoded-token="base64EncodedToken"
      />

      <ZoneCreateKubernetesInstructions
        v-else
        :zone-name="name"
        :zone-ingress-enabled="zoneIngressEnabled"
        :zone-egress-enabled="zoneEgressEnabled"
        :token="token"
        :base64-encoded-token="base64EncodedToken"
      />

      <EntityScanner
        :loader-function="scanForEnabledZone"
        :has-error="scanError !== null"
        :can-complete="isScanComplete"
      >
        <template #loading-title>
          {{ i18n.t('zones.form.scan.waitTitle') }}
        </template>

        <template #complete-title>
          {{ i18n.t('zones.form.scan.completeTitle') }}
        </template>

        <template #complete-content>
          <p>
            {{ i18n.t('zones.form.scan.completeDescription', { name }) }}
          </p>

          <p class="mt-2">
            <KButton
              appearance="primary"
              :to="{
                name: 'zone-detail-view',
                params: {
                  zone: name
                },
              }"
            >
              {{ i18n.t('zones.form.scan.completeButtonLabel', { name }) }}
            </KButton>
          </p>
        </template>

        <template #error-title>
          <h3>{{ i18n.t('zones.form.scan.errorTitle') }}</h3>
        </template>

        <template #error-content>
          <p>{{ i18n.t('zones.form.scan.errorDescription') }}</p>
        </template>
      </EntityScanner>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { KButton, KInput, KInputSwitch, KLabel, KRadio } from '@kong/kongponents'
import { computed, ref } from 'vue'

import ZoneCreateKubernetesInstructions from '../components/ZoneCreateKubernetesInstructions.vue'
import ZoneCreateUniversalInstructions from '../components/ZoneCreateUniversalInstructions.vue'
import WizardTitleBar from '@/app/common/WizardTitleBar.vue'
import EntityScanner from '@/app/wizard/components/EntityScanner.vue'
import { useI18n, useKumaApi } from '@/utilities'
import { getItemStatusFromInsight } from '@/utilities/dataplane'

const i18n = useI18n()
const kumaApi = useKumaApi()

const zone = ref<{ token: string } | null>(null)
const isCreatingZone = ref(false)
const error = ref<Error | null>(null)

const isScanComplete = ref(false)
const scanError = ref<Error | null>(null)

const name = ref('')
const environment = ref<'universal' | 'kubernetes'>('kubernetes')
const zoneIngressEnabled = ref(true)
const zoneEgressEnabled = ref(true)

const token = computed(() => zone.value !== null && zone.value.token ? zone.value.token : '')
const base64EncodedToken = computed(() => token.value !== '' ? window.btoa(token.value) : '')

const canBeSaved = computed(() => name.value !== '')

/**
 * Creates a Zone via request to the appropriate endpoint. Importantly, this returns a Zone object including a base64-encoded token which is needed for enabling the Zone in the subsequent steps of the Zone creation flow.
 */
async function createZone() {
  isCreatingZone.value = true
  error.value = null

  try {
    zone.value = await kumaApi.createZone({ name: name.value })
  } catch (err) {
    if (err instanceof Error) {
      error.value = err
    } else {
      console.error(err)
    }
  } finally {
    isCreatingZone.value = false
  }
}

/**
 * Polling callback function passed to the EntityScanner component used to determine whether a Zone was connected successfully.
 */
async function scanForEnabledZone() {
  isScanComplete.value = false
  scanError.value = null

  try {
    // The presence of a `ZoneOverview` object’s subscriptions with a connect time and without a disconnect time indicate a Zone to be online.
    const zoneOverview = await kumaApi.getZoneOverview({ name: name.value })
    const status = getItemStatusFromInsight(zoneOverview.zoneInsight)
    isScanComplete.value = status === 'online'
  } catch (err) {
    if (err instanceof Error) {
      scanError.value = err
    } else {
      console.error(err)
    }
  }
}
</script>

<style lang="scss" scoped>
// TODO: Remove these once we have this sort of style covered by our base styles.
ul:not(:first-child),
p:not(:first-child) {
  margin-top: var(--spacing-md);
}

ul {
  padding-left: var(--spacing-lg);
  list-style: disc;
}
</style>
