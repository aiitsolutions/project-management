<template>
  <div class="settings-workspace">
    <header class="settings-header">
      <div class="header-titles">
        <h1>Workspace Configuration</h1>
        <p>Manage workspace-specific rules, permissions, and advanced logic.</p>
      </div>
    </header>

    <!-- Tabs Navigation -->
    <div class="tabs-navigation">
      <div class="tabs-list">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <div class="tab-content-wrap">
            <component :is="tab.icon" class="tab-icon" />
            <span>{{ tab.name }}</span>
          </div>
          <div class="active-line" v-if="activeTab === tab.id"></div>
        </button>
      </div>
    </div>

    <!-- Active Tab Content -->
    <div class="tab-view-container">
      <transition name="fade-slide" mode="out-in">
        <!-- Statuses View -->
        <div
          v-if="activeTab === 'statuses'"
          :key="'statuses'"
          class="view-content"
        >
          <div class="view-header-row">
            <div class="vh-titles">
              <h2>Workflow Statuses</h2>
              <p>
                Configure the global lifecycle statuses for different
                application entities.
              </p>
            </div>
<button
  class="btn-save-statuses"
  :style="{ '--primary': primaryColor }"
  @click="saveItemTypes"
  :disabled="savingConditions"
>
              <svg
                v-if="!saving"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                ></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <div v-else class="spinner"></div>
              <span>{{
                saving ? "Saving Changes..." : "Save Workspace Statuses"
              }}</span>
            </button>
          </div>

          <div class="status-categories-layout">
            <!-- Sidebar Categories -->
            <div class="category-sidebar">
<button
                v-for="cat in categories"
                :key="cat.id"
                class="cat-item"
                :class="{ active: selectedCategory === cat.id }"
                @click="selectedCategory = cat.id"
              >
                <div
                  class="cat-icon-box"
                  :style="{
                    background:
                      selectedCategory === cat.id
                        ? primaryColor
                        : 'var(--color-bg-card)',
                  }"
                >
                  <component :is="cat.icon" />
                </div>
                <div class="cat-info">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-meta">{{ allStatuses[cat.id]?.length || 0 }} Statuses</span>
                </div>
                <svg
                  class="cat-chevron"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <!-- Status Editor -->
            <div class="status-editor-panel">
              <div class="panel-header">
                <h3>
                  {{
                    categories.find((c) => c.id === selectedCategory)?.name
                  }}
                  Statuses
                </h3>
                <button class="btn-add-status" @click="addStatus">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span>Add Status</span>
                </button>
              </div>

              <div class="statuses-list custom-scrollbar">
                <div
                  v-for="(status, index) in currentCategoryStatuses"
                  :key="index"
                  class="status-config-row"
                >
<div class="drag-handle">
                     <svg
                       width="16"
                       height="16"
                       viewBox="0 0 24 24"
                       fill="none"
                       stroke="var(--color-border)"
                       stroke-width="2"
                     >
                       <circle cx="9" cy="5" r="1" />
                       <circle cx="9" cy="12" r="1" />
                       <circle cx="9" cy="19" r="1" />
                       <circle cx="15" cy="5" r="1" />
                       <circle cx="15" cy="12" r="1" />
                       <circle cx="15" cy="19" r="1" />
                     </svg>
                   </div>

                  <div class="status-color-preview">
                    <input type="color" v-model="status.color" />
                  </div>

                  <div class="status-inputs">
                    <input
                      v-model="status.name"
                      type="text"
                      class="status-name-input"
                      placeholder="Status Name"
                    />
                    <span class="status-id-badge">{{
                      status.id || "new"
                    }}</span>
                  </div>

                  <div class="status-actions">
                    <label class="default-toggle" title="Set as Default">
                      <input
                        type="checkbox"
                        :checked="status.isDefault"
                        @change="setAsDefault(index)"
                      />
                      <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                      </span>
                      <span class="label-text">Default</span>
                    </label>

<button
  class="btn-save-statuses"
  :style="{ '--primary': primaryColor }"
  @click="saveItemTypes"
  :disabled="savingConditions"
>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path
                          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  v-if="currentCategoryStatuses.length === 0"
                  class="empty-statuses"
                >
                  <p>No statuses defined for this category.</p>
                </div>
              </div>

              <div class="panel-footer-hint">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span
                  >All items in the workspace will inherit these statuses
                  globally. Ensure you save changes before switching
                  categories.</span
                >
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- Status Migration Modal -->
    <transition name="modal-fade">
      <div
        v-if="showMigrationModal"
        class="modal-overlay"
        @click.self="showMigrationModal = false"
      >
        <div class="modal-container migration-modal">
          <div
            class="modal-header"
            :class="usageCount > 0 ? 'danger' : 'warning'"
          >
            <div class="modal-title-group">
              <span class="modal-label">{{
                usageCount > 0 ? "⚠️ Data Safety Guard" : "Confirm Deletion"
              }}</span>
              <h2>
                Are you sure you want to delete "{{ statusToDelete?.name }}"?
              </h2>
            </div>
            <button class="close-btn" @click="showMigrationModal = false">
              &times;
            </button>
          </div>

          <div class="modal-body">
            <!-- Case: Status In Use -->
            <div v-if="usageCount > 0">
              <div class="alert-box-urgent">
                <div class="alert-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    ></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div class="alert-text">
                  <strong>Action Required:</strong> This status is currently
                  assigned to <strong>{{ usageCount }}</strong>
                  {{
                    categories
                      .find((c) => c.id === selectedCategory)
                      ?.name.toLowerCase()
                  }}.
                </div>
              </div>

              <div class="migration-logic">
                <label class="migration-label"
                  >Move existing items to a different status:</label
                >
                <div class="select-wrapper">
                  <select v-model="targetStatusId" class="migration-select">
                    <option value="" disabled>Select target status...</option>
                    <option
                      v-for="s in otherStatuses"
                      :key="s.id"
                      :value="s.id"
                    >
                      {{ s.name }}
                    </option>
                  </select>
                  <div class="select-chevron">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
                <p class="hint-text">
                  Deleting this status will permanently reassign all affected
                  items to the selected status above. This action cannot be
                  undone.
                </p>
              </div>
            </div>

            <!-- Case: Status Empty -->
            <div v-else class="simple-confirm-body">
              <p>
                This status is not currently in use. Deleting it will
                permanently remove it from the workspace configuration.
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn-cancel"
              @click="showMigrationModal = false"
            >
              Cancel
            </button>

            <button
              v-if="usageCount > 0"
              type="button"
              class="btn-migrate"
              :disabled="!targetStatusId || migrating"
              @click="executeMigrationAndDelete"
            >
              <div v-if="migrating" class="spinner small"></div>
              <span>{{
                migrating ? "Migrating..." : "Migrate & Delete Permanently"
              }}</span>
            </button>

            <button
              v-else
              type="button"
              class="btn-delete-confirmed"
              :disabled="saving"
              @click="confirmSimpleDelete"
            >
              <span>Delete Permanently</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Workspace Conditions View -->
    <div
      v-if="activeTab === 'conditions'"
      :key="'conditions'"
      class="view-content"
    >
      <div class="view-header-row">
        <div class="vh-titles">
          <h2>Item Type Configuration</h2>
          <p>
            Configure which item types can have estimated points and can be used
            as sub-items.
          </p>
        </div>
<button
  class="btn-save-statuses"
  :style="{ '--primary': primaryColor }"
  @click="saveItemTypes"
  :disabled="savingConditions"
>
          <svg
            v-if="!savingConditions"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            ></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <div v-else class="spinner"></div>
          <span>{{ savingConditions ? "Saving..." : "Save Settings" }}</span>
        </button>
      </div>

      <div class="conditions-cards">
        <div
          v-for="condition in conditions"
          :key="condition.key"
          class="condition-card"
        >
          <div class="condition-card-header">
            <div class="condition-icon-wrap">
              <component :is="condition.icon" />
            </div>
            <div class="condition-title-group">
              <span class="condition-title">{{ condition.label }}</span>
              <span class="condition-desc">{{ condition.desc }}</span>
            </div>
          </div>
          <div class="condition-card-body">
            <template v-if="condition.forSprint">
              <div class="condition-type-row">
                <span class="type-chip sprints">Sprints</span>
                <label class="toggle-switch small">
                  <input type="checkbox" v-model="sprintSettings.includeWeekends" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </template>
            <template v-else>
              <div
                v-for="(config, type) in itemTypesSettings"
                :key="type"
                class="condition-type-row"
              >
                <span class="type-chip" :class="String(type).toLowerCase()">{{ type }}</span>
                <label class="toggle-switch small">
                  <input type="checkbox" v-model="(config as any)[condition.key]" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted } from "vue";
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: "default",
  middleware: "auth",
});

const activeTab = ref("statuses");
const selectedCategory = ref("items");
const allStatuses = ref<any>({});
const saving = ref(false);
const savingConditions = ref(false);

// Workspace color from settings
const { settings: appSettings } = useSettings()
const { addToast } = useToast()
const primaryColor = computed(() => appSettings.value.colorScheme || '#10B981')
const primaryColorLight = computed(() => {
  // Generate a lighter variant of the primary color
  const color = appSettings.value.colorScheme || '#10B981'
  // Convert hex to rgb, lighten, then back to hex
  if (color.startsWith('#')) {
    const hex = color.substring(1)
    const bigint = parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    // Lighten by mixing with white
    const lightenFactor = 0.2
    const lr = Math.round(r + (255 - r) * lightenFactor)
    const lg = Math.round(g + (255 - g) * lightenFactor)
    const lb = Math.round(b + (255 - b) * lightenFactor)

    const lightHex = `#${((1 << 24) + (lr << 16) + (lg << 8) + lb).toString(16).slice(1)}`
    return lightHex
  }
  return color
})
const borderColorLight = ref('var(--color-border-light)')
const backgroundColorLight = ref('var(--color-bg-card)')
const backgroundColorLighter = ref('var(--color-bg-subtle)')
const backgroundColorLightest = ref('var(--color-bg-main)')
const textColorPrimary = ref('var(--color-text-primary)')
const textColorSecondary = ref('var(--color-text-secondary)')
const successColor = ref('var(--color-success)')
const warningColor = ref('var(--color-warning)')
const errorColor = ref('var(--color-danger)')

// Item Types Settings
const itemTypesSettings = ref<any>({
  Story: {
    allowEstimatedPoints: true,
    canBeSubItem: true,
    allowUserAssignment: true,
  },
  Task: {
    allowEstimatedPoints: true,
    canBeSubItem: true,
    allowUserAssignment: true,
  },
  Bug: {
    allowEstimatedPoints: false,
    canBeSubItem: true,
    allowUserAssignment: true,
  },
})

// Sprint Settings
const sprintSettings = ref<any>({
  includeWeekends: false,
});

const PointsIcon = () =>
  h('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('path', { d: 'M12 8v4l3 3' }),
  ])

const SubItemIcon = () =>
  h('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polyline', { points: '9 18 15 12 9 6' }),
  ])

const AssignIcon = () =>
  h('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' }),
  ])

const SprintIcon = () =>
  h('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M22 12h-4l-3 9L9 3l-3 9H2' }),
  ])

const conditions = [
  { key: 'allowEstimatedPoints', label: 'Estimated Points', desc: 'Allow estimated story points to be set on this item type', icon: PointsIcon },
  { key: 'canBeSubItem', label: 'Sub-Items', desc: 'Allow this item type to be added as a sub-item of another', icon: SubItemIcon },
  { key: 'allowUserAssignment', label: 'User Assignment', desc: 'Allow users to be assigned to items of this type', icon: AssignIcon },
  { key: 'includeWeekends', label: 'Include Weekends', desc: 'Include weekends when calculating sprint working days', icon: SprintIcon, forSprint: true },
]

const fetchSettings = async () => {
  try {
    const [wsSettings, itemTypesData] = await Promise.all([
      $fetch("/api/settings"),
      $fetch("/api/workspace/settings"),
    ]);
    if (wsSettings?.colorScheme) {
      primaryColor.value = wsSettings.colorScheme;
      primaryColorLight.value = wsSettings.colorScheme;
    }
    if (itemTypesData?.itemTypes) {
      itemTypesSettings.value = itemTypesData.itemTypes;
    }
  } catch (e) {
    console.error("Failed to fetch workspace settings", e);
  }
};

const loadStatuses = async () => {
  try {
    const data = await $fetch("/api/workspace/statuses");
    allStatuses.value = data;
    if (data.itemTypes) {
      itemTypesSettings.value = data.itemTypes;
    }
  } catch (e) {
    console.error(e);
  }
};

const saveItemTypes = async () => {
  savingConditions.value = true;
  try {
    await Promise.all([
      $fetch("/api/workspace/settings", {
        method: "POST",
        body: { type: "itemTypes", data: itemTypesSettings.value },
      }),
      $fetch("/api/workspace/settings", {
        method: "POST",
        body: { type: "sprintSettings", data: sprintSettings.value },
      }),
    ]);
    addToast("Conditions saved", "success");
  } catch (e) {
    console.error("Failed to save item types", e);
    addToast("Failed to save conditions", "error");
  } finally {
    savingConditions.value = false;
  }
};

// Migration State
const showMigrationModal = ref(false);
const statusToDelete = ref<any>(null);
const usageCount = ref(0);
const targetStatusId = ref("");
const migrating = ref(false);

const StatusIcon = () =>
  h(
    "svg",
    {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    [
      h("rect", {
        x: "3",
        y: "3",
        width: "18",
        height: "18",
        rx: "2",
        ry: "2",
      }),
      h("line", { x1: "3", y1: "9", x2: "21", y2: "9" }),
      h("line", { x1: "9", y1: "21", x2: "9", y2: "9" }),
    ],
  );

const ItemIcon = () =>
  h(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2.5",
    },
    [
      h("path", {
        d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
      }),
    ],
  );
const ProjectIcon = () =>
  h(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2.5",
    },
    [
      h("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
      h("polyline", { points: "9 22 9 12 15 12 15 22" }),
    ],
  );
const ReleaseIcon = () =>
  h(
    "svg",
    {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2.5",
    },
    [
      h("path", {
        d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
      }),
      h("polyline", { points: "3.27 6.96 12 12.01 20.73 6.96" }),
      h("line", { x1: "12", y1: "22.08", x2: "12", y2: "12" }),
    ],
  );

const ConditionsIcon = () =>
  h(
    "svg",
    {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    [h("polyline", { points: "9 18 15 12 9 6" })],
  );

const tabs = [
  { id: "statuses", name: "Statuses", icon: StatusIcon },
  { id: "conditions", name: "Workspace Conditions", icon: ConditionsIcon },
];

const categories = [
  { id: "items", name: "Items", icon: ItemIcon },
  { id: "sprints", name: "Sprints", icon: SprintIcon },
  { id: "projects", name: "Projects", icon: ProjectIcon },
  { id: "releases", name: "Releases", icon: ReleaseIcon },
];

const currentCategoryStatuses = computed(() => {
  return allStatuses.value[selectedCategory.value] || [];
});

const otherStatuses = computed(() => {
  if (!statusToDelete.value) return [];
  return currentCategoryStatuses.value.filter(
    (s: any) => s.id !== statusToDelete.value.id,
  );
});

const addStatus = () => {
  const cat = selectedCategory.value;
  if (!allStatuses.value[cat]) allStatuses.value[cat] = [];

  const newId = `status-${Date.now()}`;
  allStatuses.value[cat].push({
    id: newId,
    name: "New Status",
    color: primaryColor.value,
    isDefault: allStatuses.value[cat].length === 0,
  });
};

const removeStatus = async (idx: number) => {
  const cat = selectedCategory.value;
  const status = allStatuses.value[cat][idx];

  if (status.isDefault) {
    alert("You cannot delete the default status.");
    return;
  }

  try {
    // Check usage on server
    const res: any = await $fetch("/api/workspace/status-actions", {
      method: "POST",
      body: {
        action: "check-usage",
        category: cat,
        statusId: status.id,
      },
    });

    if (res.count > 0) {
      statusToDelete.value = status;
      usageCount.value = res.count;
      targetStatusId.value = "";
      showMigrationModal.value = true;
    } else {
      statusToDelete.value = status;
      usageCount.value = 0;
      showMigrationModal.value = true;
    }
  } catch (e) {
    alert("Failed to verify status usage");
  }
};

const confirmSimpleDelete = async () => {
  if (!statusToDelete.value) return;
  const cat = selectedCategory.value;
  allStatuses.value[cat] = allStatuses.value[cat].filter(
    (s: any) => s.id !== statusToDelete.value.id,
  );

  showMigrationModal.value = false;
  await saveAllStatuses();
};

const executeMigrationAndDelete = async () => {
  if (!targetStatusId.value || !statusToDelete.value) return;

  migrating.value = true;
  try {
    await $fetch("/api/workspace/status-actions", {
      method: "POST",
      body: {
        action: "migrate-and-delete",
        category: selectedCategory.value,
        statusId: statusToDelete.value.id,
        targetStatusId: targetStatusId.value,
      },
    });

    showMigrationModal.value = false;
    addToast("Items Migrated & Status Deleted", "success");
    await loadStatuses();
  } catch (e) {
    addToast("Migration failed", "error");
  } finally {
    migrating.value = false;
  }
};

const setAsDefault = (idx: number) => {
  const cat = selectedCategory.value;
  allStatuses.value[cat].forEach((s: any, i: number) => {
    s.isDefault = i === idx;
  });
};

const saveAllStatuses = async () => {
  saving.value = true;
  try {
    await $fetch("/api/workspace/statuses", {
      method: "POST",
      body: {
        category: selectedCategory.value,
        statuses: allStatuses.value[selectedCategory.value],
      },
    });
    // Show success?
  } catch (e) {
    alert("Failed to save statuses");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadStatuses();
  fetchSettings();
});
</script>

<style scoped>
.settings-workspace {
  padding: 2.5rem;
  width: 100%;
  box-sizing: border-box;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-header {
  margin-bottom: 2rem;
}

.header-titles h1 {
  font-size: 1.85rem;
  font-weight: 900;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.04em;
}

.header-titles p {
  color: var(--color-text-secondary);
  font-size: 1rem;
  font-weight: 500;
}

/* Tabs Navigation */
.tabs-navigation {
               border-bottom: 1.5px solid var(--color-border-light);
   margin-bottom: 2.5rem;
}

.tabs-list {
  display: flex;
  gap: 2.5rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 0;
  color: var(--color-text-light);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--color-text-secondary);
}

.tab-content-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tab-btn:hover {
  color: var(--color-text-secondary);
}

.tab-btn.active {
  color: var(--primary-color);
}

.active-line {
  position: absolute;
  bottom: -1.5px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-color);
  border-radius: 99px;
}

/* Tab Content */
.view-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
}

.vh-titles h2 {
  font-size: 1.5rem;
  font-weight: 850;
  color: var(--color-text-primary);
  margin-bottom: 0.4rem;
  letter-spacing: -0.02em;
}

.vh-titles p {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.btn-save-statuses {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-weight: 750;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-save-statuses:hover:not(:disabled) {
  background: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px color-mix(in srgb, var(--primary-color) 30%, transparent);
}

.btn-save-statuses:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Statuses Categories Layout */
.status-categories-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2.5rem;
  background: var(--color-bg-subtle);
  border: 1.5px solid var(--color-border);
  border-radius: 28px;
  padding: 1.5rem;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border-light);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
}

.category-sidebar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cat-item:hover {
   border-color: var(--primary-color);
   background: var(--color-bg-subtle);
 }

.cat-item.active {
  border-color: var(--primary-color);
  background: var(--color-bg-card);
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
}

.cat-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: 0.2s;
}

.cat-item:not(.active) .cat-icon-box {
  color: var(--color-text-light);
}

.cat-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cat-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-text-primary);
}

.cat-meta {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.cat-chevron {
  color: var(--color-border);
  opacity: 0;
  transition: 0.2s;
}

.cat-item:hover .cat-chevron, .cat-item.active .cat-chevron {
  opacity: 1;
}

/* Status Editor Panel */
.status-editor-panel {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border-light);
  border-radius: 22px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

.panel-header h3 {
  font-size: 1.15rem;
  font-weight: 850;
  color: var(--color-text-primary);
}

.btn-add-status {
   display: flex;
   align-items: center;
   gap: 0.6rem;
   background: color-mix(in srgb, var(--primary-color) 8%, transparent);
   color: var(--primary-color);
   border: 1.5px solid color-mix(in srgb, var(--primary-color) 30%, transparent);
   padding: 0.6rem 1.25rem;
   border-radius: 10px;
   font-weight: 800;
   font-size: 0.85rem;
   cursor: pointer;
   transition: 0.2s;
}

.btn-add-status:hover {
   background: var(--primary-color);
   color: white;
}

.statuses-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.status-config-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem;
   background: var(--color-bg-card);
   border: 1.5px solid var(--color-border);
   border-radius: 14px;
   transition: 0.2s;
}

.status-config-row:hover {
  background: var(--color-bg-main);
  border-color: var(--color-border);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.drag-handle {
  cursor: grab;
  padding: 0.25rem;
}

.status-color-preview input {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 2px solid white;
  box-shadow: 0 0 0 1px var(--color-border);
  cursor: pointer;
  background: none;
  padding: 0;
}

.status-inputs {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-name-input {
  background: transparent;
  border: none;
  border-bottom: 1.5px solid transparent;
  font-size: 0.95rem;
  font-weight: 750;
  color: var(--color-text-primary);
  padding: 0.25rem 0;
  outline: none;
  transition: 0.2s;
  flex: 1;
}

.status-name-input:focus {
  border-color: var(--primary-color);
}

.status-id-badge {
  font-size: 0.65rem;
  font-weight: 700;
  background: var(--color-border-light);
  color: var(--color-text-light);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: lowercase;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.default-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.default-toggle input { display: none; }

.toggle-track {
  width: 32px;
  height: 18px;
  background: var(--color-border);
  border-radius: 20px;
  position: relative;
  transition: 0.2s;
}

.toggle-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: 0.2s;
}

.default-toggle input:checked + .toggle-track {
  background: var(--primary-color);
}

.default-toggle input:checked + .toggle-track .toggle-thumb {
  left: 17px;
}

.label-text {
  font-size: 0.8rem;
  font-weight: 750;
  color: var(--color-gray-400);
}

.btn-remove-status {
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  transition: 0.2s;
}

.btn-remove-status:hover:not(:disabled) {
  color: var(--color-danger);
  background: var(--color-red-50);
  border-radius: 8px;
}

.btn-remove-status:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.panel-footer-hint {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: var(--color-bg-main);
  padding: 1rem;
  border-radius: 12px;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.5;
}

.panel-footer-hint svg {
  flex-shrink: 0;
  color: var(--color-accent-blue);
  margin-top: 2px;
}

/* Modal Core */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-body {
  padding: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 1.75rem 2rem;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
  background: var(--color-bg-card);
}

.btn-cancel {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-weight: 750;
  cursor: pointer;
  transition: 0.2s;
}

.btn-cancel:hover {
  background: var(--color-bg-main);
  border-color: var(--color-text-light);
  color: var(--color-text-primary);
  transform: translateY(-1px);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 10px; }

.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(10px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-10px); }

/* Migration Modal Styling */
.migration-modal {
  width: 650px;
  max-width: 95vw;
  background: var(--color-bg-card);
  border-radius: 28px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.22);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalSlideUp {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header.danger {
  background: var(--color-red-50);
  border-bottom: 1px solid var(--color-red-200);
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header.warning {
  background: var(--color-amber-50);
  border-bottom: 1px solid var(--color-amber-200);
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header.warning .modal-label {
  color: var(--color-warning);
}

.modal-title-group {
  display: flex;
  flex-direction: column;
}

.modal-label {
  font-size: 0.7rem;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: 0.4rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 850;
  color: var(--color-text-primary);
  margin: 0;
}

.close-btn {
  background: rgba(0,0,0,0.05);
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.close-btn:hover {
  background: var(--color-border);
  color: var(--color-text-secondary);
}

.modal-header.danger .modal-label {
  color: var(--color-danger);
}

.alert-box-urgent {
  display: flex;
  gap: 1.25rem;
  background: var(--color-amber-50);
  border: 1.5px solid var(--color-amber-200);
  padding: 1.5rem;
  border-radius: 18px;
  color: #92400E;
  margin-bottom: 2rem;
}

.alert-icon {
  color: var(--color-warning);
  flex-shrink: 0;
}

.alert-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #92400E;
}

.alert-text strong {
  color: #78350F;
  font-weight: 800;
}

.alert-text span {
  font-weight: 800;
  color: #B45309;
}

.migration-logic {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.5rem;
}

.migration-label {
  font-size: 0.95rem;
  font-weight: 850;
  color: var(--color-text-primary);
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.migration-select {
  width: 100%;
  appearance: none;
  background: var(--color-bg-main);
  border: 2px solid var(--color-border);
  padding: 1rem 1.25rem;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.migration-select:hover {
  border-color: var(--color-text-light);
  background: var(--color-bg-card);
}

.migration-select:focus {
  border-color: var(--primary-color);
  background: var(--color-bg-card);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent);
}

.select-chevron {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-light);
  pointer-events: none;
}

.hint-text {
  font-size: 0.8rem;
  color: var(--color-text-light);
  line-height: 1.5;
  font-weight: 500;
}

.btn-migrate {
  background: var(--color-danger);
  color: white;
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-migrate:hover:not(:disabled) {
  background: #DC2626;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px rgba(220, 38, 38, 0.2);
}

.btn-delete-confirmed {
  background: var(--color-danger);
  color: white;
  border: none;
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-delete-confirmed:hover {
  background: #DC2626;
  transform: translateY(-2px);
}

.simple-confirm-body p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  font-weight: 500;
}

.btn-migrate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner.small {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

.empty-state-message {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
  background: var(--color-bg-main);
  border-radius: 12px;
  margin-top: 1rem;
}

.empty-state-message p {
  font-size: 1rem;
}

/* Condition Cards */
.conditions-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.condition-card {
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  overflow: hidden;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.condition-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--primary-color) 10%, transparent);
}

.condition-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-subtle);
}

.condition-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--primary-color) 12%, transparent);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.condition-title-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.condition-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

.condition-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.condition-card-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.condition-type-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  transition: background 0.15s;
}

.condition-type-row:last-child {
  border-bottom: none;
}

.condition-type-row:hover {
  background: var(--color-bg-subtle);
}

/* Type Chips */
.type-chip {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.type-chip.story { background: color-mix(in srgb, #16A34A 12%, transparent); color: #16A34A; }
.type-chip.task  { background: color-mix(in srgb, #2563EB 12%, transparent); color: #2563EB; }
.type-chip.bug   { background: color-mix(in srgb, #DC2626 12%, transparent); color: #DC2626; }
.type-chip.sprints { background: color-mix(in srgb, #8B5CF6 12%, transparent); color: #8B5CF6; }

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.toggle-switch input { opacity: 0; width: 0; height: 0; }

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--color-border);
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toggle-switch input:checked + .toggle-slider { background-color: var(--primary-color); }
.toggle-switch input:checked + .toggle-slider:before { transform: translateX(22px); }

.toggle-switch.small { width: 40px; height: 22px; }
.toggle-switch.small .toggle-slider:before { height: 16px; width: 16px; }
.toggle-switch.small input:checked + .toggle-slider:before { transform: translateX(18px); }
</style>
