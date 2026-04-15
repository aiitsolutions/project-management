<template>
  <div class="backlog-workspace-container">
    <div class="backlog-columns-layout">
      
      <!-- Main Backlog Section (Left) -->
      <section class="workspace-pane backlog-pool-pane">
        <header class="section-pane-header">
           <div class="header-line emerald"></div>
           <div class="header-content">
              <div class="header-row-flex">
                 <h3 class="pane-title">Backlog</h3>
                 <button class="btn-primary-pill" title="Create New Backlog Item" @click="openModal('Backlog')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Add Item</span>
                 </button>
              </div>
              <div class="header-status-breakdown">
                 <div class="status-count-item" title="Stories">
                    <span class="dot story"></span>
                    <span class="count">{{ backlogBreakdown.stories }}</span>
                    <span class="label">Stories</span>
                 </div>
                 <div class="status-count-item" title="Tasks">
                    <span class="dot task"></span>
                    <span class="count">{{ backlogBreakdown.tasks }}</span>
                    <span class="label">Tasks</span>
                 </div>
                 <div class="status-count-item" title="Bugs">
                    <span class="dot bug"></span>
                    <span class="count">{{ backlogBreakdown.bugs }}</span>
                    <span class="label">Bugs</span>
                 </div>
              </div>
           </div>
        </header>

        <div 
           class="pane-body" 
           :class="{'center-empty': backlogItems.length === 0, 'drop-active': dropTargetSprintId === 'backlog'}"
           @dragover="onDragOver($event, 'backlog')"
           @dragleave="onDragLeave"
           @drop="onDrop($event, null)"
        >
            <div v-if="loading" class="backlog-items">
               <div v-for="i in 5" :key="i" class="backlog-item-card skeleton">
                  <div class="card-details">
                     <div class="card-top">
                        <SkeletonLoader width="40px" height="12px" />
                        <SkeletonLoader width="50px" height="12px" />
                     </div>
                     <SkeletonLoader width="90%" height="16px" class="mt-2" />
                  </div>
               </div>
            </div>
            <div v-else-if="backlogItems.length > 0" class="backlog-items">
               <div v-if="selectedItems.size > 0" class="bulk-actions-bar">
                  <div class="item-checkbox" @click.stop="toggleSelectAll">
                     <div class="checkbox-indicator" :class="{ checked: selectedItems.size === totalVisibleItems }">
                        <svg v-if="selectedItems.size === totalVisibleItems" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </div>
                  </div>
                  <span class="selected-count">{{ selectedItems.size }} selected</span>
                   <div class="bulk-actions">
                      <!-- Custom Dropdown -->
                      <div class="custom-dropdown" @click.stop="toggleBulkDropdown">
                         <div class="dropdown-trigger">
                            <span>{{ bulkActionLabel }}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                         </div>
                          <div v-if="bulkDropdownOpen" class="dropdown-menu">
                             <div class="dropdown-item" @click.stop="bulkAction = 'status'">Change Status</div>
                             <div class="dropdown-item" @click.stop="bulkAction = 'priority'">Change Priority</div>
                             <div class="dropdown-item" @click.stop="bulkAction = 'type'">Change Type</div>
                             <div class="dropdown-item" @click.stop="bulkAction = 'sprint'">Move to Sprint</div>
                             <div class="dropdown-item danger" @click.stop="bulkAction = 'delete'">Delete Items</div>
                          </div>
                      </div>
                      
<!-- Status Options -->
                       <div v-if="bulkAction === 'status'" class="custom-dropdown">
                          <div class="dropdown-trigger" @click.stop="toggleStatusDropdown">
                             <span>{{ bulkStatus }}</span>
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </div>
                          <div v-if="statusDropdownOpen" class="dropdown-menu">
                             <div class="dropdown-item" @click.stop="bulkStatus = 'Backlog'; statusDropdownOpen = false">Backlog</div>
                             <div v-for="status in workspaceStatuses" :key="status.id" class="dropdown-item" @click.stop="bulkStatus = status.name; statusDropdownOpen = false">{{ status.name }}</div>
                          </div>
                       </div>
                      
                      <!-- Priority Options -->
                      <div v-else-if="bulkAction === 'priority'" class="custom-dropdown">
                         <div class="dropdown-trigger" @click.stop="togglePriorityDropdown">
                            <span>{{ bulkPriority }}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                         </div>
                         <div v-if="priorityDropdownOpen" class="dropdown-menu">
                            <div class="dropdown-item" @click.stop="bulkPriority = 'Low'; priorityDropdownOpen = false">Low</div>
                            <div class="dropdown-item" @click.stop="bulkPriority = 'Medium'; priorityDropdownOpen = false">Medium</div>
                            <div class="dropdown-item" @click.stop="bulkPriority = 'High'; priorityDropdownOpen = false">High</div>
                         </div>
                      </div>
                      
                      <!-- Type Options -->
                      <div v-else-if="bulkAction === 'type'" class="custom-dropdown">
                         <div class="dropdown-trigger" @click.stop="toggleTypeDropdown">
                            <span>{{ bulkType }}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                         </div>
                         <div v-if="typeDropdownOpen" class="dropdown-menu">
                            <div class="dropdown-item" @click.stop="bulkType = 'Story'; typeDropdownOpen = false">Story</div>
                            <div class="dropdown-item" @click.stop="bulkType = 'Task'; typeDropdownOpen = false">Task</div>
                            <div class="dropdown-item" @click.stop="bulkType = 'Bug'; typeDropdownOpen = false">Bug</div>
                         </div>
                      </div>
                      
                      <!-- Sprint Options -->
                      <div v-else-if="bulkAction === 'sprint'" class="custom-dropdown">
                         <div class="dropdown-trigger" @click.stop="toggleSprintDropdown">
                            <span>{{ getSelectedSprintName() }}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                         </div>
                         <div v-if="sprintDropdownOpen" class="dropdown-menu">
                            <div class="dropdown-item" @click.stop="bulkSprintId = null; sprintDropdownOpen = false">Backlog</div>
                            <div v-for="sprint in displayedSprints" :key="sprint.id" class="dropdown-item" @click.stop="bulkSprintId = sprint.id; sprintDropdownOpen = false">{{ sprint.name }}</div>
                         </div>
                      </div>
                      
                      <button v-if="bulkAction" class="bulk-action-btn apply" @click="applyBulkAction">Apply</button>
                      <button class="bulk-action-btn" @click="clearSelection">Clear</button>
                   </div>
                </div>
               <template v-for="item in backlogItems" :key="item.id">
                   <div 
                      class="backlog-item-card" 
                      :class="{ 'drop-target': dropTargetParentId === item.id, 'selected': selectedItems.has(item.id) }"
                      draggable="true"
                      @dragstart="onDragStart(item.id)"
                      @dragover.prevent="onDragOverParent($event, item.id)"
                      @dragleave="dropTargetParentId = null"
                      @drop="onDropAsSubItem($event, item.id)"
                   >
                      <div class="item-checkbox" @click.stop="toggleItemSelection(item.id)">
                         <div class="checkbox-indicator" :class="{ checked: selectedItems.has(item.id) }">
                            <svg v-if="selectedItems.has(item.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                         </div>
                      </div>
                      <div v-if="getSubItems(item.id).length > 0" class="expand-toggle" @click.stop="toggleExpand(item.id)">
                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: expandedItems.has(item.id) }">
                            <polyline points="9 18 15 12 9 6"></polyline>
                         </svg>
                         <span class="sub-count">{{ getSubItems(item.id).length }}</span>
                      </div>
                       <div class="card-details" @click="viewItem(item.id)">
                          <div class="card-top">
                             <span class="task-id">{{ item.uid }}</span>
                             <span class="type-chip" :class="item.type?.toLowerCase()">{{ item.type }}</span>
                             <div class="priority-chip" :class="item.priority?.toLowerCase()">{{ item.priority }}</div>
                             <div class="task-status-tag" :class="item.status.toLowerCase().replace(' ', '-')">{{ item.status }}</div>
                          </div>
                          <div class="title">{{ item.title }}</div>
                       </div>
                   </div>
                   
                    <!-- Collapsible Sub Items -->
                    <div v-if="getSubItems(item.id).length > 0 && expandedItems.has(item.id)" class="sub-items-container">
                       <template v-for="sub in getSubItems(item.id)" :key="sub.id">
                           <div 
                              class="backlog-item-card sub-item-card" 
                              :class="{ 'drop-target': dropTargetParentId === sub.id, 'selected': selectedItems.has(sub.id) }"
                              draggable="true"
                              @dragstart="onDragStart(sub.id)"
                              @dragover.prevent="onDragOverParent($event, sub.id)"
                              @dragleave="dropTargetParentId = null"
                              @drop="onDropAsSubItem($event, sub.id)"
                              @click.stop="viewItem(sub.id)"
                           >
                              <div class="item-checkbox" @click.stop="toggleItemSelection(sub.id)">
                                 <div class="checkbox-indicator" :class="{ checked: selectedItems.has(sub.id) }">
                                    <svg v-if="selectedItems.has(sub.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                 </div>
                              </div>
                              <div class="sub-item-indicator"></div>
                              <div class="card-details">
                                 <div class="card-top">
                                    <span class="task-id">{{ sub.uid }}</span>
                                    <span class="type-chip" :class="sub.type.toLowerCase()">{{ sub.type }}</span>
                                    <div class="priority-chip" :class="sub.priority?.toLowerCase()">{{ sub.priority }}</div>
                                    <div class="task-status-tag" :class="sub.status.toLowerCase().replace(' ', '-')">{{ sub.status }}</div>
                                 </div>
                                 <div class="title">{{ sub.title }}</div>
                              </div>
                             <div class="item-actions" @click.stop>
                                <button class="action-menu-btn" @click="toggleSubItemMenu(sub.id)">
                                   <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                                </button>
                                <div v-if="openSubItemMenuId === sub.id" class="action-dropdown">
                                   <button class="dropdown-item" @click="removeAsSubItem(sub.id)">Make an Item</button>
                                </div>
                             </div>
                          </div>
                       </template>
                    </div>
                </template>
             </div>
           
           <div v-else class="empty-state">
              <div class="empty-icon">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <p>Backlog is Empty</p>
            </div>
         </div>
       </section>

      <!-- Sprint Section (Right) -->
      <section class="workspace-pane sprint-planning-pane">
        <header class="section-pane-header">
           <div class="header-line emerald"></div>
           <div class="header-content">
              <div class="header-row-flex">
                 <h3 class="pane-title">Sprints</h3>
                 <button class="btn-primary-pill emerald" title="Create New Sprint" @click="showSprintModal = true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Create Sprint</span>
                 </button>
              </div>
           </div>
        </header>

        <div class="pane-body">
           <div v-if="sprints.length === 0" class="empty-sprints">
              <p>No sprints yet. Create your first sprint!</p>
           </div>
           
            <div class="sprints-accordion">
               <div 
                  v-for="sprint in displayedSprints" 
                  :key="sprint.id" 
                  class="accordion-item" 
                  :class="{ 
                    expanded: activeSprintId === sprint.id,
                    'drop-active': dropTargetSprintId === sprint.id 
                  }"
                  @dragover="onDragOver($event, sprint.id)"
                  @dragleave="onDragLeave"
                  @drop="onDrop($event, sprint.id)"
               >
                  <div class="accordion-header" @click="selectSprint(sprint)">
                     <div class="header-main-info">
                        <div class="expand-icon" :class="{ rotate: activeSprintId === sprint.id }">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                        <h4 class="sprint-name">{{ sprint.name }}</h4>
                        <span class="sprint-badge" :class="sprint.status.toLowerCase().replace(' ', '-')">{{ sprint.status }}</span>
                        
                        <!-- Sprint Status Breakdown -->
                        <div class="header-status-breakdown sprint-internal-breakdown">
                           <div class="status-count-item" title="Stories">
                              <span class="dot story"></span>
                              <span class="count">{{ getSprintBreakdown(sprint.id).stories }}</span>
                           </div>
                           <div class="status-count-item" title="Tasks">
                              <span class="dot task"></span>
                              <span class="count">{{ getSprintBreakdown(sprint.id).tasks }}</span>
                           </div>
                           <div class="status-count-item" title="Bugs">
                              <span class="dot bug"></span>
                              <span class="count">{{ getSprintBreakdown(sprint.id).bugs }}</span>
                           </div>
                        </div>
                      </div>

                      <div class="header-actions-area">
                         <div class="sprint-meta-info">
                            <span class="item-count">{{ getSprintItemsCount(sprint.id) }} items</span>
                            <span class="date-range">{{ formatDateShort(sprint.startDate) }} - {{ formatDateShort(sprint.endDate) }}</span>
                         </div>
                         <div class="header-main-actions">
                            <button class="eye-btn" title="View Sprint Details" @click.stop="viewSprintDetails(sprint.id)">
                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                         </div>
                      </div>
                   </div>

                     <transition name="collapse">
                        <div v-if="activeSprintId === sprint.id" class="accordion-content">
                            <div v-if="sprintItems.length > 0" class="sprint-items-list">
                              <div v-if="selectedItems.size > 0" class="bulk-actions-bar">
                                 <div class="item-checkbox" @click.stop="toggleSelectAllSprint">
                                    <div class="checkbox-indicator" :class="{ checked: selectedItems.size === totalSprintVisibleItems }">
                                       <svg v-if="selectedItems.size === totalSprintVisibleItems" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                 </div>
                                 <span class="selected-count">{{ selectedItems.size }} selected</span>
                                 <div class="bulk-actions">
                                     <!-- Custom Dropdown -->
                                     <div class="custom-dropdown" @click.stop="toggleBulkDropdown">
                                        <div class="dropdown-trigger">
                                           <span>{{ bulkActionLabel }}</span>
                                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                         <div v-if="bulkDropdownOpen" class="dropdown-menu">
                                            <div class="dropdown-item" @click.stop="bulkAction = 'status'">Change Status</div>
                                            <div class="dropdown-item" @click.stop="bulkAction = 'priority'">Change Priority</div>
                                            <div class="dropdown-item" @click.stop="bulkAction = 'type'">Change Type</div>
                                            <div class="dropdown-item" @click.stop="bulkAction = 'sprint'">Move to Sprint</div>
                                            <div class="dropdown-item danger" @click.stop="bulkAction = 'delete'">Delete Items</div>
                                         </div>
                                     </div>
                                     
                                     <!-- Status Options -->
                                     <div v-if="bulkAction === 'status'" class="custom-dropdown">
                                        <div class="dropdown-trigger" @click.stop="toggleStatusDropdown">
                                           <span>{{ bulkStatus }}</span>
                                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
<div v-if="statusDropdownOpen" class="dropdown-menu">
                                            <div class="dropdown-item" @click.stop="bulkStatus = 'Backlog'; statusDropdownOpen = false">Backlog</div>
                                            <div v-for="status in workspaceStatuses" :key="status.id" class="dropdown-item" @click.stop="bulkStatus = status.name; statusDropdownOpen = false">{{ status.name }}</div>
                                         </div>
                                     </div>
                                     
                                     <!-- Priority Options -->
                                     <div v-else-if="bulkAction === 'priority'" class="custom-dropdown">
                                        <div class="dropdown-trigger" @click.stop="togglePriorityDropdown">
                                           <span>{{ bulkPriority }}</span>
                                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        <div v-if="priorityDropdownOpen" class="dropdown-menu">
                                           <div class="dropdown-item" @click.stop="bulkPriority = 'Low'; priorityDropdownOpen = false">Low</div>
                                           <div class="dropdown-item" @click.stop="bulkPriority = 'Medium'; priorityDropdownOpen = false">Medium</div>
                                           <div class="dropdown-item" @click.stop="bulkPriority = 'High'; priorityDropdownOpen = false">High</div>
                                        </div>
                                     </div>
                                     
                                     <!-- Type Options -->
                                     <div v-else-if="bulkAction === 'type'" class="custom-dropdown">
                                        <div class="dropdown-trigger" @click.stop="toggleTypeDropdown">
                                           <span>{{ bulkType }}</span>
                                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        <div v-if="typeDropdownOpen" class="dropdown-menu">
                                           <div class="dropdown-item" @click.stop="bulkType = 'Story'; typeDropdownOpen = false">Story</div>
                                           <div class="dropdown-item" @click.stop="bulkType = 'Task'; typeDropdownOpen = false">Task</div>
                                           <div class="dropdown-item" @click.stop="bulkType = 'Bug'; typeDropdownOpen = false">Bug</div>
                                        </div>
                                     </div>
                                     
                                     <!-- Sprint Options -->
                                     <div v-else-if="bulkAction === 'sprint'" class="custom-dropdown">
                                        <div class="dropdown-trigger" @click.stop="toggleSprintDropdown">
                                           <span>{{ getSelectedSprintName() }}</span>
                                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </div>
                                        <div v-if="sprintDropdownOpen" class="dropdown-menu">
                                           <div class="dropdown-item" @click.stop="bulkSprintId = null; sprintDropdownOpen = false">Backlog</div>
                                           <div v-for="sprint in displayedSprints" :key="sprint.id" class="dropdown-item" @click.stop="bulkSprintId = sprint.id; sprintDropdownOpen = false">{{ sprint.name }}</div>
                                        </div>
                                     </div>
                                     
                                     <button v-if="bulkAction" class="bulk-action-btn apply" @click="applyBulkAction">Apply</button>
                                    <button class="bulk-action-btn" @click="clearSelection">Clear</button>
                                 </div>
                              </div>
                             <template v-for="item in sprintItems" :key="item.id">
                              <div 
                                 class="sprint-task-row" 
                                 :class="{ 'drop-target': dropTargetParentId === item.id, 'selected': selectedItems.has(item.id) }"
                                 draggable="true"
                                 @dragstart="onDragStart(item.id)"
                                 @dragover.prevent="onDragOverParent($event, item.id)"
                                 @dragleave="dropTargetParentId = null"
                                 @drop="onDropAsSubItem($event, item.id)"
                              >
                                 <div class="item-checkbox" @click.stop="toggleItemSelection(item.id)">
                                    <div class="checkbox-indicator" :class="{ checked: selectedItems.has(item.id) }">
                                       <svg v-if="selectedItems.has(item.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                 </div>
                                 <div v-if="getSubItems(item.id).length > 0" class="expand-toggle" @click.stop="toggleExpandSprint(item.id)">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: expandedSprintItems.has(item.id) }">
                                       <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                    <span class="sub-count">{{ getSubItems(item.id).length }}</span>
                                 </div>
                                  <div class="task-row-content" @click="viewItem(item.id)">
                                     <div class="task-row-top">
                                        <span class="task-uid">{{ item.uid }}</span>
                                        <span class="task-type" :class="item.type?.toLowerCase()">{{ item.type }}</span>
                                        <span class="priority-chip" :class="item.priority?.toLowerCase()">{{ item.priority }}</span>
                                        <div class="task-status-tag" :class="item.status.toLowerCase().replace(' ', '-')">{{ item.status }}</div>
                                     </div>
                                     <div class="task-row-title">{{ item.title }}</div>
                                  </div>
                                 
                                 <button class="task-remove-btn" title="Move to Backlog" @click.stop="removeFromSprint(item.id)">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                 </button>
                              </div>

                              <!-- Collapsible Sprint Sub Items -->
                              <div v-if="getSubItems(item.id).length > 0 && expandedSprintItems.has(item.id)" class="sprint-sub-items-container">
                                 <template v-for="sub in getSubItems(item.id)" :key="sub.id">
                                    <div 
                                       class="sprint-task-row sub-sprint-task-row" 
                                       :class="{ 'drop-target': dropTargetParentId === sub.id, 'selected': selectedItems.has(sub.id) }"
                                       draggable="true"
                                       @dragstart="onDragStart(sub.id)"
                                       @dragover.prevent="onDragOverParent($event, sub.id)"
                                       @dragleave="dropTargetParentId = null"
                                       @drop="onDropAsSubItem($event, sub.id)"
                                       @click.stop="viewItem(sub.id)"
                                    >
                                       <div class="item-checkbox" @click.stop="toggleItemSelection(sub.id)">
                                          <div class="checkbox-indicator" :class="{ checked: selectedItems.has(sub.id) }">
                                             <svg v-if="selectedItems.has(sub.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                          </div>
                                       </div>
                                       <div class="sub-item-indicator-bar"></div>
                                       <div class="task-row-content">
                                           <div class="task-row-top">
                                              <span class="task-uid">{{ sub.uid }}</span>
                                              <span class="task-type" :class="sub.type.toLowerCase()">{{ sub.type }}</span>
                                              <span class="priority-chip" :class="sub.priority?.toLowerCase()">{{ sub.priority }}</span>
                                              <div class="task-status-tag" :class="sub.status.toLowerCase().replace(' ', '-')">{{ sub.status }}</div>
                                           </div>
                                           <div class="task-row-title">{{ sub.title }}</div>
                                        </div>
                                       
                                       <div class="item-actions" @click.stop>
                                          <button class="action-menu-btn" @click="toggleSprintSubItemMenu(sub.id)">
                                             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                                          </button>
                                          <div v-if="openSprintSubItemMenuId === sub.id" class="action-dropdown">
                                             <button class="dropdown-item" @click="removeSprintSubItem(sub.id)">Make an Item</button>
                                          </div>
                                       </div>
                                    </div>
                                 </template>
                              </div>
                            </template>
                          </div>
                        <div v-else class="empty-sprint-tasks">
                           <p>No tasks assigned to this sprint.</p>
                        </div>
                     </div>
                   </transition>
                </div>
             </div>
        </div>
      </section>
    </div>

    <!-- Create Sprint Modal -->
    <div v-if="showSprintModal" class="modal-overlay" @click.self="showSprintModal = false">
      <div class="modal-container sprint-modal">
        <div class="modal-header">
          <h2>{{ sprintForm.id ? 'Edit Sprint' : 'Create New Sprint' }}</h2>
          <button class="close-btn" @click="showSprintModal = false">×</button>
        </div>
        <form @submit.prevent="createSprint" class="modal-form-wrapper">
          <div class="scrollable-form-content">
            <div class="form-main-layout">
              <!-- Left Side: Core Details -->
              <div class="form-column-left">
                <div class="input-group">
                  <label>Sprint Title</label>
                  <input type="text" v-model="sprintForm.name" required placeholder="e.g. Sprint 1 - Core Features" />
                </div>
                
                <div class="input-group">
                  <label>Description (Rich Text Editor)</label>
                  <div class="rich-text-container">
                     <div class="rich-text-toolbar">
                        <button type="button" class="tool-btn" @click="formatText('bold')" title="Bold"><b>B</b></button>
                        <button type="button" class="tool-btn" @click="formatText('italic')" title="Italic"><i>I</i></button>
                        <button type="button" class="tool-btn" @click="formatText('bulletList')" title="List">•</button>
                        <div class="tool-divider"></div>
                        <span class="tool-label">Rich Editor Active</span>
                     </div>
                     <textarea v-model="sprintForm.description" class="textarea-input rich-editor" placeholder="Describe the goals and scope of this sprint..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Right Side: Metadata & Schedule -->
              <div class="form-column-right">
                <div class="input-group">
                   <label>Import Users From</label>
                   <select v-model="importSprintId" class="select-input highlight" @change="handleImportUsers">
                      <option value="">Choose a previous sprint...</option>
                      <option v-for="s in sprints" :key="s.id" :value="s.id">{{ s.name }}</option>
                   </select>
                </div>

                <div class="input-group">
                  <label>Sprint Owner</label>
                  <select v-model="sprintForm.ownerId" class="select-input">
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <div class="form-row">
                  <div class="input-group">
                    <label>Start Date</label>
                    <input type="date" v-model="sprintForm.startDate" required @change="calculateDuration" />
                  </div>
                  <div class="input-group">
                    <label>End Date</label>
                    <input type="date" v-model="sprintForm.endDate" required @change="calculateDuration" />
                  </div>
                </div>

                <div class="input-group" v-if="sprintForm.id">
                   <label>Sprint Status</label>
                   <select v-model="sprintForm.status" class="select-input highlight">
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                   </select>
                </div>
                
                <div class="input-group" v-if="sprintDuration">
                  <label>Calculated Timeline</label>
                  <div class="duration-display">📅 {{ sprintDuration }} (working time)</div>
                </div>
              </div>
            </div>

            <div class="form-section-divider"></div>

            <div class="input-group">
               <div class="section-label-row">
                  <label>Sprint Users (Available Users)</label>
                  <span class="selection-count">{{ sprintForm.memberIds.length }} Selected</span>
               </div>
               <div class="user-selection-grid">
                  <div v-for="user in users" :key="user.id" class="user-checkbox-item" :class="{ selected: sprintForm.memberIds.includes(user.id) }" @click="toggleUser(user.id)">
                     <img :src="`https://ui-avatars.com/api/?name=${user.name}&background=10B981&color=fff`" class="checkbox-avatar" />
                     <div class="user-selection-info">
                        <span class="uname">{{ user.name }}</span>
                        <span class="uemail">{{ user.email }}</span>
                     </div>
                     <div class="checkbox-indicator">
                        <svg v-if="sprintForm.memberIds.includes(user.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
          <div class="modal-actions sticky-footer">
            <button type="button" class="btn btn-secondary" @click="showSprintModal = false">Discard Changes</button>
            <button type="submit" class="btn btn-primary">{{ sprintForm.id ? 'Update Sprint' : 'Create & Start Sprint' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Sprint Details Modal -->
    <div v-if="showViewSprintModal" class="modal-overlay" @click.self="showViewSprintModal = false">
      <div class="modal-container sprint-modal view-mode">
        <div class="modal-header">
          <div class="header-title-group">
            <span class="view-label">Sprint Overview</span>
            <h2>{{ selectedSprintDetails?.name }}</h2>
          </div>
          <div class="header-actions">
            <button v-if="selectedSprintDetails?.status === 'Not Started'" class="btn-start-action" title="Start Sprint" @click="startSprintFromModal(selectedSprintDetails.id)">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
               <span>Start</span>
            </button>
            <button class="close-btn" @click="showViewSprintModal = false">×</button>
          </div>
        </div>
        
        <div class="view-sprint-body">
          <div class="view-main-content">
            <section class="view-section">
              <label>Sprint Objective & Goals</label>
              <div class="rich-text-view" v-html="formatRichText(selectedSprintDetails?.description)"></div>
            </section>

            <section class="view-section">
              <div class="section-label-row">
                <label>Assigned Users ({{ selectedSprintDetails?.memberIds?.length || 0 }})</label>
              </div>
              <div class="view-user-grid">
                <div v-for="memberId in selectedSprintDetails?.memberIds" :key="memberId" class="view-user-card">
                  <img :src="getUserPhoto(memberId)" class="view-avatar" />
                  <div class="view-user-info">
                    <span class="vname">{{ getUserName(memberId) }}</span>
                    <span class="vrole">Sprint User</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside class="view-sidebar">
            <div class="meta-card">
              <div class="meta-item">
                <span class="m-label">Status</span>
                <span class="sprint-badge" :class="selectedSprintDetails?.status?.toLowerCase().replace(' ', '-')">{{ selectedSprintDetails?.status }}</span>
              </div>
              <div class="meta-item">
                <span class="m-label">Timeline</span>
                <div class="m-value timeline-box">
                  <div class="t-date">
                    <span class="t-lbl">Start</span>
                    <strong>{{ formatDateLong(selectedSprintDetails?.startDate) }}</strong>
                  </div>
                  <div class="t-divider"></div>
                  <div class="t-date">
                    <span class="t-lbl">End</span>
                    <strong>{{ formatDateLong(selectedSprintDetails?.endDate) }}</strong>
                  </div>
                </div>
              </div>
              <div class="meta-item">
                <span class="m-label">Owner</span>
                <div class="m-value owner-pill">
                  <img :src="getUserPhoto(selectedSprintDetails?.ownerId)" />
                  <span>{{ getUserName(selectedSprintDetails?.ownerId) }}</span>
                </div>
              </div>
            </div>

            <div class="stats-card">
              <div class="stat-box">
                <span class="s-val">{{ getSprintItemsCount(selectedSprintDetails?.id) }}</span>
                <span class="s-lbl">Total Tasks</span>
              </div>
            </div>
          </aside>
        </div>

        <div class="sticky-footer view-footer">
          <button class="btn btn-danger" @click="deleteSprint">Delete Sprint</button>
          <div class="flex-spacer"></div>
          <button class="btn btn-secondary" @click="showViewSprintModal = false">Close</button>
          <button class="btn btn-primary" @click="editCurrentSprint">Edit Sprint</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmModal" class="modal-overlay danger-overlay" @click.self="showDeleteConfirmModal = false">
       <div class="confirm-modal-container">
          <div class="confirm-icon">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h3>Delete Sprint?</h3>
          <p>Are you sure you want to delete <strong>"{{ selectedSprintDetails?.name }}"</strong>? This action will permanently remove the sprint and cannot be undone.</p>
          
          <div class="confirm-actions">
             <button class="btn-cancel" @click="showDeleteConfirmModal = false">Cancel</button>
             <button class="btn-confirm-delete" @click="confirmDeleteSprint">Yes, Delete Sprint</button>
          </div>
       </div>
    </div>

    <!-- Cannot Delete Warning Modal -->
    <div v-if="showDeleteWarningModal" class="modal-overlay warning-overlay" @click.self="showDeleteWarningModal = false">
       <div class="confirm-modal-container warning-container">
          <div class="confirm-icon warning-icon">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3>Cannot Delete Sprint</h3>
          <p>The sprint <strong>"{{ selectedSprintDetails?.name }}"</strong> still contains active tasks. Please move or remove all tasks from the sprint before attempting to delete it.</p>
          
          <div class="confirm-actions">
             <button class="btn-save" @click="showDeleteWarningModal = false">Understand</button>
          </div>
       </div>
    </div>

    <!-- Start Sprint Confirmation Modal -->
    <div v-if="showStartConfirmModal" class="modal-overlay warning-overlay" @click.self="showStartConfirmModal = false">
      <div class="confirm-modal-container">
        <div class="warning-icon-wrapper">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        </div>
        <h3>Start Sprint?</h3>
        <p>This will activate <strong>{{ selectedSprintDetails?.name }}</strong>. All tasks will be moved to the Active Sprint section for real-time tracking.</p>
        <div class="confirm-modal-actions">
          <button class="btn-cancel-flat" @click="showStartConfirmModal = false">Not Yet</button>
          <button class="btn-confirm-start" @click="confirmStartSprint">Start Tracking Now</button>
        </div>
      </div>
    </div>

    <!-- Create Item Modal Integration -->
    <CreateItemModal 
      :is-open="showCreateModal" 
      initial-target="Backlog"
      @close="showCreateModal = false"
      @submit="handleItemCreated"
    />

    <!-- Success Animation Modal -->
    <div v-if="showSuccessAnimation" class="modal-overlay success-anim-overlay">
       <div class="animation-content">
          <div class="rocket-wrapper">
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4.5c1.13-1.14 2-1.5 2-1.5"></path><path d="M12 15v5s3.03-.55 4.5-2c1.14-1.13 1.5-2 1.5-2"></path><path d="M15 9h.01"></path></svg>
          </div>
          <h2>Ignition Success!</h2>
          <p>Moving your items to the Sprint Tracking view...</p>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const { user: currentUser } = useAuth()

const backlogItems = ref<any[]>([])
const subItemsMap = ref(new Map<number, any[]>())
const backlogBreakdown = ref({ stories: 0, tasks: 0, bugs: 0 })
const sprints = ref<any[]>([])
const displayedSprints = computed(() => {
  return sprints.value.filter(s => s.status === 'Not Started')
})
const users = ref<any[]>([])
const workspaceStatuses = ref<any[]>([])
const itemTypeSettings = ref<any>({
  Story: { canBeSubItem: true },
  Task: { canBeSubItem: true },
  Bug: { canBeSubItem: true }
})
const allProjectItems = ref<any[]>([])
const activeSprintId = ref<number | null>(null)
const sprintItems = ref<any[]>([])
const selectedBacklogItem = ref('')
const showStartConfirmModal = ref(false)
const showSuccessAnimation = ref(false)
const draggedItemId = ref<number | null>(null)
const dropTargetSprintId = ref<number | string | null>(null)
const dropTargetParentId = ref<number | null>(null)
const expandedItems = ref(new Set<number>())
const expandedSprintItems = ref(new Set<number>())
const openSubItemMenuId = ref<number | null>(null)
const openSprintSubItemMenuId = ref<number | null>(null)
const selectedItems = ref(new Set<number>())
const bulkAction = ref('')
const bulkStatus = ref('To Do')
const bulkPriority = ref('Medium')
const bulkType = ref('Task')
const bulkSprintId = ref<number | null>(null)

const totalVisibleItems = computed(() => {
  return backlogItems.value.length + getAllSubItems().length
})

const totalSprintVisibleItems = computed(() => {
  return sprintItems.value.length + getAllSprintSubItems().length
})

const toggleSelectAll = () => {
  if (selectedItems.value.size === totalVisibleItems.value) {
    selectedItems.value.clear()
  } else {
    backlogItems.value.forEach(item => selectedItems.value.add(item.id))
    getAllSubItems().forEach(sub => selectedItems.value.add(sub.id))
  }
}

const toggleSelectAllSprint = () => {
  if (selectedItems.value.size === totalSprintVisibleItems.value) {
    selectedItems.value.clear()
  } else {
    sprintItems.value.forEach(item => selectedItems.value.add(item.id))
    getAllSprintSubItems().forEach(sub => selectedItems.value.add(sub.id))
  }
}

const getAllSubItems = () => {
  const subItems: any[] = []
  backlogItems.value.forEach(item => {
    const subs = subItemsMap.value?.get(item.id) || []
    subItems.push(...subs)
  })
  return subItems
}

const getAllSprintSubItems = () => {
  const subItems: any[] = []
  sprintItems.value.forEach(item => {
    const subs = subItemsMap.value?.get(item.id) || []
    subItems.push(...subs)
  })
  return subItems
}

const applyBulkAction = async () => {
  if (!bulkAction.value || selectedItems.value.size === 0) return
  
  const itemIds = Array.from(selectedItems.value)
  
  // Confirm delete action
  if (bulkAction.value === 'delete') {
    const confirmMsg = `Are you sure you want to delete ${itemIds.length} item(s)? This action cannot be undone.`
    if (!confirm(confirmMsg)) return
  }
  
  try {
    if (bulkAction.value === 'status') {
      for (const id of itemIds) {
        await $fetch(`/api/items?id=${id}`, {
          method: 'PUT',
          body: { status: bulkStatus.value }
        })
      }
    } else if (bulkAction.value === 'priority') {
      for (const id of itemIds) {
        await $fetch(`/api/items?id=${id}`, {
          method: 'PUT',
          body: { priority: bulkPriority.value }
        })
      }
    } else if (bulkAction.value === 'type') {
      for (const id of itemIds) {
        await $fetch(`/api/items?id=${id}`, {
          method: 'PUT',
          body: { type: bulkType.value }
        })
      }
    } else if (bulkAction.value === 'sprint') {
      for (const id of itemIds) {
        await $fetch(`/api/items?id=${id}`, {
          method: 'PUT',
          body: { sprintId: bulkSprintId.value }
        })
      }
    } else if (bulkAction.value === 'delete') {
      let deletedCount = 0
      for (const id of itemIds) {
        try {
          console.log('Deleting item:', id)
          await $fetch(`/api/items?id=${id}`, {
            method: 'DELETE'
          })
          console.log('Deleted item:', id)
          deletedCount++
        } catch (err) {
          console.error(`Failed to delete item ${id}:`, err)
        }
      }
      if (deletedCount > 0) {
        addToast(`${deletedCount} item(s) deleted successfully`, 'success')
      }
    }
    
    clearSelection()
    bulkAction.value = ''
    await fetchItems()
  } catch (e: any) {
    console.error('Bulk action failed:', e)
    alert('Bulk action failed: ' + (e.message || e))
  }
}

const toggleItemSelection = (itemId: number) => {
  if (selectedItems.value.has(itemId)) {
    selectedItems.value.delete(itemId)
  } else {
    selectedItems.value.add(itemId)
  }
}

const clearSelection = () => {
  selectedItems.value.clear()
}

const bulkDropdownOpen = ref(false)
const statusDropdownOpen = ref(false)
const priorityDropdownOpen = ref(false)
const typeDropdownOpen = ref(false)
const sprintDropdownOpen = ref(false)

const bulkActionLabel = computed(() => {
  switch (bulkAction.value) {
    case 'status': return 'Change Status'
    case 'priority': return 'Change Priority'
    case 'type': return 'Change Type'
    case 'sprint': return 'Move to Sprint'
    case 'delete': return 'Delete Items'
    default: return 'Actions...'
  }
})

const toggleBulkDropdown = () => {
  closeAllDropdowns()
  bulkDropdownOpen.value = !bulkDropdownOpen.value
}

const toggleStatusDropdown = () => {
  closeAllDropdowns()
  statusDropdownOpen.value = !statusDropdownOpen.value
}

const togglePriorityDropdown = () => {
  closeAllDropdowns()
  priorityDropdownOpen.value = !priorityDropdownOpen.value
}

const toggleTypeDropdown = () => {
  closeAllDropdowns()
  typeDropdownOpen.value = !typeDropdownOpen.value
}

const toggleSprintDropdown = () => {
  closeAllDropdowns()
  sprintDropdownOpen.value = !sprintDropdownOpen.value
}

const closeAllDropdowns = () => {
  bulkDropdownOpen.value = false
  statusDropdownOpen.value = false
  priorityDropdownOpen.value = false
  typeDropdownOpen.value = false
  sprintDropdownOpen.value = false
}

const getSelectedSprintName = () => {
  if (bulkSprintId.value === null) return 'Backlog'
  const sprint = sprints.value.find(s => s.id === bulkSprintId.value)
  return sprint ? sprint.name : 'Backlog'
}

const toggleExpand = (itemId: number) => {
  if (expandedItems.value.has(itemId)) {
    expandedItems.value.delete(itemId)
  } else {
    expandedItems.value.add(itemId)
  }
}

const toggleExpandSprint = (itemId: number) => {
  if (expandedSprintItems.value.has(itemId)) {
    expandedSprintItems.value.delete(itemId)
  } else {
    expandedSprintItems.value.add(itemId)
  }
}

const toggleSubItemMenu = (itemId: number) => {
  openSubItemMenuId.value = openSubItemMenuId.value === itemId ? null : itemId
}

const toggleSprintSubItemMenu = (itemId: number) => {
  openSprintSubItemMenuId.value = openSprintSubItemMenuId.value === itemId ? null : itemId
}

const removeAsSubItem = async (itemId: number) => {
  try {
    await $fetch(`/api/items?id=${itemId}`, {
      method: 'PUT',
      body: { parentId: null }
    })
    openSubItemMenuId.value = null
    await fetchItems()
  } catch (e) {
    alert('Failed to remove sub-item')
  }
}

const removeSprintSubItem = async (itemId: number) => {
  try {
    await $fetch(`/api/items?id=${itemId}`, {
      method: 'PUT',
      body: { parentId: null }
    })
    openSprintSubItemMenuId.value = null
    await fetchItems()
  } catch (e) {
    alert('Failed to remove sub-item')
  }
}

const showSprintModal = ref(false)
const showViewSprintModal = ref(false)
const showDeleteConfirmModal = ref(false)
const showDeleteWarningModal = ref(false)
const showCreateModal = ref(false)
const selectedSprintDetails = ref<any>(null)
const sprintDuration = ref('')

const projectId = computed(() => Number(route.params.id))

const sprintForm = ref({
  id: null as number | null,
  name: '',
  description: '',
  ownerId: null as number | null,
  memberIds: [] as number[],
  startDate: '',
  endDate: '',
  status: 'Not Started'
})

const importSprintId = ref('')

const handleImportUsers = () => {
  if (!importSprintId.value) return
  const sprintToImport = sprints.value.find(s => s.id === Number(importSprintId.value))
  if (sprintToImport && sprintToImport.memberIds) {
    const newMemberIds = [...new Set([...sprintForm.value.memberIds, ...sprintToImport.memberIds])]
    sprintForm.value.memberIds = newMemberIds
  }
}

const toggleUser = (userId: number) => {
  const index = sprintForm.value.memberIds.indexOf(userId)
  if (index === -1) {
    sprintForm.value.memberIds.push(userId)
  } else {
    sprintForm.value.memberIds.splice(index, 1)
  }
}

const formatText = (command: string) => {
  const textarea = document.querySelector('.rich-editor') as HTMLTextAreaElement
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = sprintForm.value.description
  const selectedText = text.substring(start, end)
  let newText = ''
  if (command === 'bold') newText = `**${selectedText}**`
  else if (command === 'italic') newText = `*${selectedText}*`
  else if (command === 'bulletList') newText = `\n- ${selectedText}`
  sprintForm.value.description = text.substring(0, start) + newText + text.substring(end)
}

const calculateDuration = () => {
  if (sprintForm.value.startDate && sprintForm.value.endDate) {
    const start = new Date(sprintForm.value.startDate)
    const end = new Date(sprintForm.value.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    sprintDuration.value = `${diffDays} day${diffDays !== 1 ? 's' : ''}`
  } else {
    sprintDuration.value = ''
  }
}

const fetchUsers = async () => {
  try {
    const data = await $fetch<any[]>('/api/users')
    users.value = data
    if (currentUser.value?.id) {
      sprintForm.value.ownerId = currentUser.value.id
    }
  } catch (e) {
    console.error('Failed to fetch users')
  }
}

const fetchItems = async () => {
  if (!projectId.value || isNaN(projectId.value)) {
    console.error('Invalid project ID:', projectId.value)
    return
  }
  
  try {
    console.log('Fetching items for project:', projectId.value)
    
    const items = await $fetch<any[]>(`/api/items?projectId=${projectId.value}`)
    console.log('Fetched items:', items)
    
    if (!items || !Array.isArray(items)) {
      console.error('Invalid items response:', items)
      return
    }
    
    allProjectItems.value = items
    
    // Build valid sprint IDs set for filtering orphaned items
    const sprintsData = await $fetch<any[]>(`/api/sprints?projectId=${projectId.value}`)
    const validSprintIds = new Set(sprintsData.map((s: any) => s.id))
    
    // Backlog items: Only show items NOT assigned to any sprint
    const parentItems = items.filter((i: any) => {
      if (i.parentId) return false
      
      // Show in backlog if:
      // 1. No sprint expanded - show items WITHOUT a sprintId only
      // 2. Sprint expanded - show items WITHOUT a sprintId only (items in sprints should NOT show in backlog)
      if (activeSprintId.value === null) {
        console.log('No sprint expanded, checking item:', i.uid, 'sprintId:', i.sprintId)
        return !i.sprintId
      }
      // When a sprint is expanded, items in ANY sprint should NOT appear in backlog
      // Only items without sprintId (true backlog items) should show
      const showInBacklog = !i.sprintId
      console.log('Sprint', activeSprintId.value, 'expanded, item:', i.uid, 'sprintId:', i.sprintId, 'showInBacklog:', showInBacklog)
      return showInBacklog
    })
    backlogItems.value = parentItems
    console.log('Parent backlog items:', parentItems.length)
    
    subItemsMap.value = new Map(items.filter((i: any) => i.parentId).map(i => [i.parentId, items.filter((sub: any) => sub.parentId === i.parentId)]))
    
    backlogBreakdown.value = {
      stories: parentItems.filter((i: any) => i.type === 'Story').length,
      tasks: parentItems.filter((i: any) => i.type === 'Task').length,
      bugs: parentItems.filter((i: any) => i.type === 'Bug').length
    }
    
    // Sprint items: must have valid sprint AND be parent items AND match active sprint
    sprintItems.value = items.filter((i: any) => {
      if (!i.sprintId || i.parentId) return false
      if (!validSprintIds.has(i.sprintId)) return false
      return i.sprintId === activeSprintId.value
    })
    console.log('Sprint items:', sprintItems.value.length)
  } catch (e: any) {
    console.error('Failed to fetch items:', e)
  }
}

const getSubItems = (parentId: number): any[] => {
  return subItemsMap.value?.get(parentId) || []
}

const fetchSprints = async () => {
  if (!projectId.value) return
  try {
    const data = await $fetch<any[]>(`/api/sprints?projectId=${projectId.value}`)
    sprints.value = data
  } catch (e) {
    console.error('Failed to fetch sprints')
  }
}

const createSprint = async () => {
  try {
    const isEditing = !!sprintForm.value.id
    const method = isEditing ? 'PUT' : 'POST'
    const url = isEditing ? `/api/sprints?id=${sprintForm.value.id}` : '/api/sprints'

    await $fetch(url, {
      method,
      body: {
        projectId: Number(route.params.id),
        name: sprintForm.value.name,
        description: sprintForm.value.description,
        ownerId: sprintForm.value.ownerId,
        memberIds: sprintForm.value.memberIds,
        startDate: sprintForm.value.startDate,
        endDate: sprintForm.value.endDate,
        status: sprintForm.value.status
      }
    })
    
    showSprintModal.value = false
    // Reset form
    sprintForm.value = { 
      id: null,
      name: '', 
      description: '', 
      ownerId: currentUser.value?.id || null, 
      memberIds: [], 
      startDate: '', 
      endDate: '', 
      status: 'Not Started' 
    }
    importSprintId.value = ''
    sprintDuration.value = ''
    await fetchSprints()
  } catch (e) {
    alert('Failed to save sprint')
  }
}

const selectSprint = (sprint: any) => {
  activeSprintId.value = activeSprintId.value === sprint.id ? null : sprint.id
  selectedBacklogItem.value = ''
  fetchItems()
}

const getSprintItemsCount = (sprintId: number | undefined) => {
  if (!sprintId) return 0
  return allProjectItems.value.filter(i => i.sprintId === sprintId).length
}

const getSprintBreakdown = (sprintId: number | undefined) => {
  if (!sprintId) return { stories: 0, tasks: 0, bugs: 0 }
  const sprintItems = allProjectItems.value.filter(i => i.sprintId === sprintId)
  return {
    stories: sprintItems.filter(i => i.type === 'Story').length,
    tasks: sprintItems.filter(i => i.type === 'Task').length,
    bugs: sprintItems.filter(i => i.type === 'Bug').length
  }
}

const formatDateShort = (dateString: string | undefined | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const startSprint = async (id: number) => {
  try {
    await $fetch(`/api/sprints?id=${id}`, {
      method: 'PUT',
      body: { status: 'In Progress' }
    })
    await fetchSprints()
  } catch (e) {
    alert('Failed to start sprint')
  }
}

const startSprintFromModal = () => {
  showStartConfirmModal.value = true
}

const confirmStartSprint = async () => {
  if (!selectedSprintDetails.value) return
  const id = selectedSprintDetails.value.id
  
  try {
    showStartConfirmModal.value = false
    showViewSprintModal.value = false
    
    // Start Animation
    showSuccessAnimation.value = true
    
    // Wait for cinematic feel
    await new Promise(r => setTimeout(r, 2000))
    
    await $fetch(`/api/sprints?id=${id}`, {
      method: 'PUT',
      body: { status: 'In Progress' }
    })
    
    addToast('Sprint Started Successfully! 🚀', 'success')
    await fetchSprints()
    showSuccessAnimation.value = false
  } catch (e) {
    showSuccessAnimation.value = false
    addToast('Failed to start sprint', 'error')
  }
}

const removeFromSprint = async (itemId: number) => {
  try {
    await $fetch(`/api/items?id=${itemId}`, {
      method: 'PUT',
      body: { 
        sprintId: null,
        status: 'Backlog' // Revert to Backlog status
      }
    })
    addToast('Item moved back to Backlog', 'info')
    await fetchItems()
  } catch (e) {
    addToast('Failed to remove item', 'error')
  }
}

const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  console.log('fetchData started, projectId:', projectId.value)
  try {
    const [itemsData, sprintsData, usersData, statusData] = await Promise.all([
      $fetch<any[]>(`/api/items?projectId=${projectId.value}`),
      $fetch<any[]>(`/api/sprints?projectId=${projectId.value}`),
      $fetch<any[]>('/api/users'),
      $fetch<any>('/api/workspace/statuses')
    ])
    allProjectItems.value = itemsData
    sprints.value = sprintsData
    users.value = usersData
    workspaceStatuses.value = statusData.items || []
    if (statusData.itemTypes) {
      itemTypeSettings.value = statusData.itemTypes
    }
    
    // Include items with no sprintId OR items whose sprintId doesn't exist (orphaned)
    const validSprintIds = new Set(sprintsData.map((s: any) => s.id))
    const parentItems = itemsData.filter((i: any) => {
      // Must not be a sub-item
      if (i.parentId) return false
      
      // Only show items in backlog if:
      // 1. No sprint assigned (sprintId is null)
      // 2. Sprint doesn't exist (orphaned) - show all items
      if (activeSprintId.value === null) {
        // Items with a valid sprint assigned should NOT appear in backlog
        if (i.sprintId && validSprintIds.has(i.sprintId)) return false
        return true
      }
      
      // A sprint IS expanded - only show items NOT in that sprint
      return i.sprintId !== activeSprintId.value
    })
    backlogItems.value = parentItems
    
    sprintItems.value = itemsData.filter((i: any) => {
      if (!i.sprintId || i.parentId) return false
      if (!validSprintIds.has(i.sprintId)) return false
      // Only show items for the currently selected sprint
      return i.sprintId === activeSprintId.value
    })
    
    backlogBreakdown.value = {
      stories: parentItems.filter((i: any) => i.type === 'Story').length,
      tasks:   parentItems.filter((i: any) => i.type === 'Task').length,
      bugs:    parentItems.filter((i: any) => i.type === 'Bug').length
    }
    
    // Fix count breakdown for the active sprint too
    const sprintBreakdownValue = {
      stories: sprintItems.value.filter((i: any) => i.type === 'Story').length,
      tasks:   sprintItems.value.filter((i: any) => i.type === 'Task').length,
      bugs:    sprintItems.value.filter((i: any) => i.type === 'Bug').length
    }
    
    // Build sub-items map
    subItemsMap.value = new Map(
      itemsData
        .filter((i: any) => i.parentId)
        .map(i => [i.parentId, itemsData.filter((sub: any) => sub.parentId === i.parentId)])
    )
    console.log('fetchData completed, backlogItems:', backlogItems.value, 'length:', backlogItems.value?.length)
  } catch (e) {
    console.error('Failed to fetch backlog data:', e)
  } finally {
    await nextTick()
    loading.value = false
    console.log('loading set to false, backlogItems:', backlogItems.value, 'length:', backlogItems.value?.length)
  }
}

onMounted(() => {
  console.log('Backlog mounted, route params:', route.params, 'projectId:', projectId.value)
  fetchData()
})

watch(projectId, (newId) => {
  console.log('Project ID changed:', newId)
  if (newId) {
    fetchData()
  }
})

watch(() => route.fullPath, () => {
  console.log('Route changed, refetching data')
  fetchData()
})

const openModal = (target: string) => {
  showCreateModal.value = true
}

const handleItemCreated = () => {
  fetchItems()
}

const viewItem = (id: number) => {
  router.push(`/workspace/projects/${route.params.id}/items/${id}?from=backlog`)
}

const viewSprintDetails = (sprintId: number) => {
  const sprint = sprints.value.find(s => s.id === sprintId)
  if (sprint) {
    selectedSprintDetails.value = sprint
    showViewSprintModal.value = true
  }
}

// Drag and Drop Logic
const canBeSubItem = (itemType: string) => {
  return itemTypeSettings.value[itemType]?.canBeSubItem ?? true
}

const onDragStart = (itemId: number) => {
  const item = allProjectItems.value.find((i: any) => i.id === itemId)
  if (item && !canBeSubItem(item.type)) {
    alert(`${item.type} cannot be added as a sub-item. Disable this in Workspace Settings.`)
    return
  }
  draggedItemId.value = itemId
}

const onDragOver = (event: DragEvent, targetId: number | string | null) => {
  event.preventDefault()
  dropTargetSprintId.value = targetId
}

const onDragLeave = () => {
  dropTargetSprintId.value = null
}

const onDrop = async (event: DragEvent, sprintId: number | null) => {
  event.preventDefault()
  const itemId = draggedItemId.value
  if (itemId === null) return
  
  const targetStatus = sprintId ? 'To Do' : 'Backlog'
  
  try {
    await $fetch(`/api/items?id=${itemId}`, {
      method: 'PUT',
      body: { 
        sprintId: sprintId,
        status: targetStatus
      }
    })
    await fetchItems()
  } catch (e) {
    alert('Move failed')
  } finally {
    draggedItemId.value = null
    dropTargetSprintId.value = null
  }
}

const onDragOverParent = (event: DragEvent, parentId?: number) => {
  event.preventDefault()
  if (parentId) {
    dropTargetParentId.value = parentId
  }
}

const onDropAsSubItem = async (event: DragEvent, parentId: number) => {
  event.preventDefault()
  const itemId = draggedItemId.value
  if (itemId === null) return
  
  if (itemId === parentId) {
    alert('Cannot make an item a sub-item of itself')
    draggedItemId.value = null
    dropTargetParentId.value = null
    return
  }
  
  try {
    await $fetch(`/api/items?id=${itemId}`, {
      method: 'PUT',
      body: { parentId: parentId }
    })
    await fetchItems()
  } catch (e) {
    alert('Failed to associate as sub-item')
  } finally {
    draggedItemId.value = null
    dropTargetParentId.value = null
  }
}

const editCurrentSprint = () => {
  showViewSprintModal.value = false
  // Populate sprintForm with details and open showSprintModal
  sprintForm.value = { 
    id: selectedSprintDetails.value.id,
    name: selectedSprintDetails.value.name,
    description: selectedSprintDetails.value.description,
    ownerId: selectedSprintDetails.value.ownerId,
    memberIds: [...(selectedSprintDetails.value.memberIds || [])],
    startDate: selectedSprintDetails.value.startDate,
    endDate: selectedSprintDetails.value.endDate,
    status: selectedSprintDetails.value.status || 'Not Started'
  }
  calculateDuration()
  showSprintModal.value = true
}

const deleteSprint = () => {
  const itemCount = getSprintItemsCount(selectedSprintDetails.value?.id)
  
  if (itemCount > 0) {
    showDeleteWarningModal.value = true
    return
  }
  
  showDeleteConfirmModal.value = true
}

const confirmDeleteSprint = async () => {
  try {
    await $fetch(`/api/sprints?id=${selectedSprintDetails.value.id}`, {
      method: 'DELETE'
    })
    showDeleteConfirmModal.value = false
    showViewSprintModal.value = false
    await fetchSprints()
  } catch (e) {
    alert('Failed to delete sprint')
  }
}

const getUserName = (userId: number | undefined) => {
  if (!userId) return 'Unassigned'
  const user = users.value.find(u => u.id === userId)
  return user ? user.name : 'Unknown User'
}

const getUserPhoto = (userId: number | undefined) => {
  if (!userId) return `https://ui-avatars.com/api/?name=U&background=F3F4F6&color=6B7280`
  const user = users.value.find(u => u.id === userId)
  if (user?.profile_photo) return user.profile_photo
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=10B981&color=fff`
}

const formatRichText = (text: string | undefined) => {
  if (!text) return '<i>No description provided.</i>'
  // Basic simulation of markdown to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n- (.*?)/g, '<li>$1</li>')
    .replace(/\n/g, '<br>')
}

const formatDateLong = (dateString: string | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.backlog-workspace-container { 
  padding: 0; 
  margin: 0;
  width: 100%;
  min-height: 100vh;
  font-family: var(--font-family) !important;
}
.backlog-columns-layout { 
  display: grid; 
  grid-template-columns: 1fr 1.2fr; 
  gap: 1.5rem; 
  height: calc(100vh - 40px);
  overflow: hidden;
  padding: 1.5rem;
  background: var(--color-bg-card);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}

.workspace-pane {
  background: var(--color-bg-card);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-light);
  height: 100%;
  overflow: hidden;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.backlog-pool-pane, .sprint-planning-pane { background: var(--color-bg-main) !important; border-color: var(--color-border); }
.backlog-pool-pane .section-pane-header, .sprint-planning-pane .section-pane-header { background: var(--color-bg-main) !important; }
.backlog-pool-pane .pane-footer, .sprint-planning-pane .pane-footer { background: var(--color-bg-main) !important; }

.section-pane-header { padding: 1.5rem 2rem; display: flex; align-items: center; gap: 1.25rem; border-bottom: 1px solid var(--color-border-light); background: var(--color-bg-card); border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
.header-line { width: 4px; height: 36px; background: var(--primary-color); border-radius: 4px; flex-shrink: 0; }
.header-line.emerald { background: var(--primary-color); }

.header-content { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.header-row-flex { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.pane-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0; }

.header-status-breakdown { display: flex; align-items: center; gap: 1rem; margin-top: 0.1rem; }
.status-count-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.65rem; font-weight: 500; color: var(--color-text-muted); text-transform: uppercase; }
.status-count-item .count { color: var(--color-text-primary); font-weight: 700; font-size: 0.75rem; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.dot.story { background: #10B981; }
.dot.task { background: #3B82F6; }
.dot.bug { background: #EF4444; }

.sprint-internal-breakdown {
  margin-top: 0 !important;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid var(--color-border);
}

.sprint-internal-breakdown .status-count-item .label {
  display: none;
}

.btn-primary-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary-pill:hover {
  filter: brightness(0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px color-mix(in srgb, var(--primary-color) 30%, transparent);
}


.pane-body { flex: 1; overflow-y: auto; padding: 1rem; transition: background 0.2s, border-color 0.2s; border: 2px solid transparent; border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
.pane-body.drop-active { background: color-mix(in srgb, var(--primary-color) 8%, transparent); border-color: var(--primary-color); border-style: dashed; }
.center-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.pane-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--color-border-light); background: var(--color-bg-card); }

.btn-ghost-add {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: transparent;
  border: 1.5px dashed var(--color-border);
  color: var(--color-text-light);
  padding: 0.85rem;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
}
.btn-ghost-add:hover { border-color: var(--color-text-primary); color: var(--color-text-primary); }

.backlog-item-card { background: var(--color-bg-card); border: 1px solid var(--color-border-light); border-radius: 14px; padding: 1rem; display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; cursor: grab; transition: transform 0.2s, box-shadow 0.2s; }
.backlog-item-card:active { cursor: grabbing; transform: scale(0.98); opacity: 0.6; }
.backlog-item-card.drop-target { border-color: var(--primary-color); border-style: dashed; background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.backlog-item-card.selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }

.item-checkbox { flex-shrink: 0; cursor: pointer; }
.checkbox-indicator { width: 20px; height: 20px; border: 2px solid var(--color-border); border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.checkbox-indicator.checked { background: var(--primary-color); border-color: var(--primary-color); color: white; }

.backlog-items-header { margin-bottom: 1rem; }
.bulk-actions-bar { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: linear-gradient(135deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 80%, black) 100%); color: white; border-radius: 10px; margin-bottom: 0.75rem; flex-wrap: wrap; box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 30%, transparent); }
.selected-count { font-weight: 600; font-size: 0.9rem; }
.bulk-actions { display: flex; align-items: center; gap: 0.5rem; }
.bulk-select { padding: 0.4rem 0.8rem; border: none; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; min-width: 120px; background: white; color: var(--color-text-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.3); }
.bulk-action-btn { background: white; color: var(--primary-color); border: none; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.bulk-action-btn.apply { background: color-mix(in srgb, var(--primary-color) 80%, black); color: white; }

.bulk-options { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
.bulk-options select, .bulk-options input { padding: 0.35rem 0.6rem; border: none; border-radius: 6px; font-size: 0.8rem; }

.expand-toggle { display: flex; align-items: center; gap: 0.35rem; padding: 0.25rem; cursor: pointer; color: var(--color-text-muted); flex-shrink: 0; }
.expand-toggle svg { transition: transform 0.2s; }
.expand-toggle svg.rotated { transform: rotate(90deg); }
.sub-count { font-size: 0.7rem; font-weight: 700; background: var(--primary-color); color: white; padding: 0.15rem 0.4rem; border-radius: 10px; min-width: 18px; text-align: center; }
.expand-toggle.sprint-expand { margin-right: 0.5rem; }
.backlog-item-card.drop-target::after { content: 'Drop to make sub-item'; position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: var(--primary-color); white-space: nowrap; }

.sub-items-container { margin-left: 1.5rem; border-left: 2px solid var(--color-border-light); padding-left: 0.5rem; }
.sub-item-card { position: relative; margin-bottom: 0.5rem; background: var(--color-bg-main); }
.sub-item-card:hover { border-color: var(--primary-color); }
.sub-item-indicator { position: absolute; left: -12px; top: 50%; width: 10px; height: 2px; background: var(--primary-color); }
.card-details { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }
.card-top { display: flex; align-items: center; gap: 0.75rem; }
.task-id { font-family: monospace; font-size: 0.75rem; font-weight: 700; color: var(--primary-color); }
.type-chip { font-size: 0.7rem; font-weight: 600; color: var(--color-info); text-transform: uppercase; background: var(--color-bg-main); padding: 0.15rem 0.5rem; border-radius: 6px; }
.type-chip.story { background: rgba(16, 185, 129, 0.15); color: #10B981; }
.type-chip.task { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
.type-chip.bug { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
.priority-chip { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 6px; }
.priority-chip.high { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
.priority-chip.medium { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
.priority-chip.low { background: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); }
.status-chip { font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; background: var(--color-bg-main); padding: 0.15rem 0.5rem; border-radius: 6px; }
.title { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }

.empty-state { text-align: center; color: var(--color-border); padding: 2rem; }

.empty-sprints { text-align: center; padding: 2rem; color: var(--color-text-light); }

.sprints-accordion { display: flex; flex-direction: column; border: 1px solid var(--color-border); border-radius: 16px; overflow: hidden; background: var(--color-bg-card); }
.accordion-item { border-bottom: 1px solid var(--color-border-light); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 2px solid transparent; }
.accordion-item:last-child { border-bottom: none; }
.accordion-item.expanded { background: var(--color-bg-main); }
.accordion-item.drop-active { background: color-mix(in srgb, var(--primary-color) 8%, transparent); border: 2px dashed var(--primary-color); transform: scale(1.01); z-index: 10; boxShadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }

.accordion-header { padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s; }
.accordion-header:hover { background: var(--color-bg-main); }

.header-main-info { display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0; }
.expand-icon { color: var(--color-text-light); transition: transform 0.3s; flex-shrink: 0; }
.expand-icon.rotate { transform: rotate(180deg); color: var(--primary-color); }

.sprint-name { 
  margin: 0; 
  font-size: 0.95rem; 
  font-weight: 700; 
  color: var(--color-text-primary); 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}
.sprint-badge { font-size: 0.65rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.02em; flex-shrink: 0; }
.sprint-badge.completed { background: #D0FBE0; color: #065F46; }

.sprint-internal-breakdown {
  margin-top: 0 !important;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid var(--color-border);
  flex-shrink: 0;
}

.sprint-internal-breakdown .status-count-item .label {
  display: none;
}

.header-actions-area { display: flex; align-items: center; gap: 1.5rem; flex-shrink: 0; }
.header-actions { display: flex; align-items: center; gap: 0.75rem; }

.sprint-meta-info { display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; }
.item-count { font-size: 0.75rem; font-weight: 600; color: var(--primary-color); }
.date-range { font-size: 0.65rem; font-weight: 500; color: var(--color-text-light); }

.eye-btn { background: var(--color-bg-card); border: 1.5px solid var(--color-border); color: var(--color-text-muted); width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.eye-btn:hover { background: var(--color-bg-main); border-color: var(--primary-color); color: var(--primary-color); transform: scale(1.05); }

.accordion-content { padding: 0 1rem 1.5rem 1rem; border-top: 1px solid var(--color-border-light); }
.sprint-items-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }

.sprint-task-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.85rem 1.25rem; background: var(--color-bg-card); border: 1.2px solid var(--color-border-light); border-radius: 12px; cursor: grab; transition: all 0.2s; }
.sprint-task-row:active { cursor: grabbing; opacity: 0.6; }
.sprint-task-row.drop-target { border-color: var(--primary-color); border-style: dashed; background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.sprint-task-row.selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.sprint-task-row:active { cursor: grabbing; opacity: 0.6; }
.sprint-task-row:hover { border-color: var(--primary-color); transform: translateX(6px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

.task-row-content { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.task-row-top { display: flex; align-items: center; gap: 0.75rem; }

.task-uid { font-family: monospace; font-size: 0.75rem; font-weight: 800; color: var(--primary-color); }
.task-type { font-size: 0.65rem; font-weight: 700; color: var(--color-info); text-transform: uppercase; background: var(--color-bg-main); padding: 0.1rem 0.4rem; border-radius: 4px; }
.task-type.story { background: rgba(16, 185, 129, 0.15); color: #10B981; }
.task-type.task { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
.task-type.bug { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
.task-status-tag { font-size: 0.65rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; background: var(--color-bg-main); padding: 0.2rem 0.6rem; border-radius: 6px; }
.task-status-tag.in-progress { background: rgba(59, 130, 246, 0.15); color: var(--color-info); }
.task-status-tag.completed { background: #D0FBE0; color: #065F46; }
.task-status-tag.backlog { background: var(--color-border-light); color: var(--color-text-muted); }
.task-status-tag.to-do { background: var(--color-border); color: var(--color-text-secondary); }

.task-row-title { font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.task-remove-btn { background: transparent; border: none; color: var(--color-border); cursor: pointer; padding: 0.25rem; transition: color 0.2s; flex-shrink: 0; }
.task-remove-btn:hover { color: var(--color-danger); }

.sprint-sub-items-container { margin-left: 1.5rem; border-left: 2px solid var(--color-border-light); padding-left: 0.5rem; }
.sub-sprint-task-row { position: relative; background: var(--color-bg-main); }
.sub-sprint-task-row:hover { border-color: var(--primary-color); transform: translateX(4px); }
.sub-item-indicator-bar { position: absolute; left: -12px; top: 50%; width: 10px; height: 2px; background: var(--primary-color); }
.task-type.story { color: #10B981; }
.task-type.task { color: #3B82F6; }
.task-type.bug { color: #EF4444; }

/* Transitions */
.collapse-enter-active, .collapse-leave-active { transition: all 0.3s ease-out; max-height: 500px; opacity: 1; }
.collapse-enter-from, .collapse-leave-to { max-height: 0; opacity: 0; overflow: hidden; }

.btn-cancel:hover { background: var(--color-border-light); color: var(--color-text-primary); }

/* Full Screen Modal Styles */
.modal-overlay { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(0, 0, 0, 0.4); 
  backdrop-filter: blur(8px);
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 1000; 
}

.modal-container.sprint-modal { 
  background: var(--color-bg-card); 
  width: 100%; 
  max-width: 1300px; 
  margin: 0; 
  border-radius: 24px; 
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
  height: 90vh; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
  from { transform: scale(0.95) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-header { 
  padding: 1.5rem 3rem; 
  border-bottom: 1px solid var(--color-border-light); 
  background: var(--color-bg-card); 
  flex-shrink: 0;
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}

.modal-header h2 { 
  font-size: 1.85rem; 
  font-weight: 900; 
  color: var(--color-text-primary); 
  margin: 0;
  letter-spacing: -0.03em;
}

.close-btn { 
  width: 36px; 
  height: 36px; 
  border-radius: 50%; 
  background: var(--color-border-light); 
  border: none;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--color-text-muted);
  transition: all 0.2s; 
}

.close-btn:hover { 
  background: rgba(239, 68, 68, 0.1); 
  color: var(--color-danger); 
  transform: rotate(90deg); 
}

.modal-form-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.scrollable-form-content {
  flex: 1;
  overflow-y: auto;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.sticky-footer {
  padding: 1.5rem 3rem;
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-card);
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.form-main-layout {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 3rem;
  align-items: start;
}

.form-column-left, .form-column-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-row { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 1.5rem; 
}

.input-group { 
  display: flex; 
  flex-direction: column; 
  gap: 0.6rem; 
}

.input-group label { 
  font-size: 0.75rem; 
  font-weight: 700; 
  color: var(--color-text-secondary); 
  text-transform: uppercase; 
  letter-spacing: 0.05em; 
}

.input-group input, 
.input-group textarea, 
.input-group select { 
  padding: 0.85rem 1rem; 
  border: 1.5px solid var(--color-border); 
  border-radius: 12px; 
  font-size: 0.95rem; 
  outline: none; 
  background: var(--color-bg-main);
  color: var(--color-text-primary);
  transition: all 0.2s; 
}

.input-group input:focus, 
.input-group textarea:focus, 
.input-group select:focus { 
  border-color: var(--primary-color); 
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary-color) 15%, transparent); 
  background: var(--color-bg-card);
}

.textarea-input { 
  min-height: 100px; 
  resize: vertical; 
  font-family: inherit; 
}

.duration-display { 
  padding: 1rem; 
  background: color-mix(in srgb, var(--primary-color) 10%, white); 
  border: 1.5px solid var(--primary-color); 
  border-radius: 12px; 
  font-weight: 700; 
  color: var(--primary-color); 
  font-size: 1rem; 
}

.form-section-divider {
  height: 1.5px;
  background: var(--color-border-light);
  width: 100%;
}

.section-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.selection-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-color);
  background: color-mix(in srgb, var(--primary-color) 10%, transparent);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
}

.user-selection-info {
  display: flex;
  flex-direction: column;
}

.uname { font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary); }
.uemail { font-size: 0.7rem; color: var(--color-text-muted); margin-top: -0.1rem; }

.btn-save { 
  background: var(--primary-color); 
  color: white; 
  border: none; 
  padding: 1rem 2.5rem; 
  border-radius: 14px; 
  font-weight: 700; 
  font-size: 1rem;
  cursor: pointer; 
  transition: background 0.2s; 
}

.btn-save:hover { filter: brightness(0.9); }

.btn-cancel { 
  background: var(--color-bg-main); 
  border: 1.5px solid var(--color-border); 
  color: var(--color-text-muted); 
  padding: 1rem 2.5rem; 
  border-radius: 14px; 
  font-weight: 700; 
  font-size: 1rem;
  cursor: pointer; 
  transition: all 0.2s; 
}

.btn-cancel:hover { background: var(--color-border-light); color: var(--color-text-primary); border-color: var(--color-border); }

/* Components inside Modal */
.rich-text-container { border: 1.5px solid var(--color-border); border-radius: 14px; overflow: hidden; background: var(--color-bg-main); box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.rich-text-toolbar { background: var(--color-bg-main); padding: 0.6rem; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; gap: 0.5rem; }
.tool-btn { background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 6px; padding: 0.35rem 0.75rem; cursor: pointer; font-size: 0.9rem; font-weight: 500; color: var(--color-text-primary); }
.tool-btn:hover { background: var(--color-border-light); border-color: var(--color-border); }
.tool-divider { width: 1px; height: 18px; background: var(--color-border); margin: 0 0.25rem; }
.tool-label { font-size: 0.7rem; color: var(--color-text-light); font-weight: 700; text-transform: uppercase; margin-left: auto; letter-spacing: 0.05em; }
.rich-editor { border: none !important; border-radius: 0 !important; min-height: 250px; box-shadow: none !important; background: transparent; color: var(--color-text-primary); }

.user-selection-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
  gap: 1rem; 
  max-height: 400px; 
  overflow-y: auto; 
  padding: 1rem; 
  background: var(--color-bg-main); 
  border-radius: 14px; 
  border: 1.5px solid var(--color-border); 
}

.user-checkbox-item { display: flex; align-items: center; gap: 0.85rem; padding: 0.75rem; background: var(--color-bg-card); border: 1.5px solid var(--color-border); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
.user-checkbox-item:hover { border-color: var(--primary-color); transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.user-checkbox-item.selected { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 8%, transparent); }
.checkbox-avatar { width: 28px; height: 28px; border-radius: 50%; }
.checkbox-indicator { width: 20px; height: 20px; border: 2px solid var(--color-border); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--primary-color); transition: all 0.2s; }
.selected .checkbox-indicator { border-color: var(--primary-color); background: var(--primary-color); color: white; }

.select-input.highlight { border-color: var(--color-info); background: rgba(59, 130, 246, 0.1); font-weight: 700; color: var(--color-info); }

/* View Sprint Modal Styles */
.view-mode { max-width: 1200px !important; }
.header-title-group { display: flex; flex-direction: column; }
.view-label { font-size: 0.7rem; font-weight: 800; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; }

.view-sprint-body { padding: 3rem; display: grid; grid-template-columns: 1fr 320px; gap: 4rem; overflow-y: auto; flex: 1; }
.view-main-content { display: flex; flex-direction: column; gap: 2.5rem; }
.view-section { display: flex; flex-direction: column; gap: 0.75rem; }
.view-section label { font-size: 0.8rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 2px solid var(--color-border-light); padding-bottom: 0.5rem; }

.rich-text-view { font-size: 1.05rem; line-height: 1.6; color: var(--color-text-secondary); }
.rich-text-view strong { color: var(--color-text-primary); }

.view-user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.85rem; }
.view-user-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.85rem; background: var(--color-bg-main); border-radius: 12px; border: 1px solid transparent; transition: all 0.2s; }
.view-user-card:hover { background: var(--color-bg-card); border-color: var(--color-border); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.view-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid var(--color-bg-card); }
.view-user-info { display: flex; flex-direction: column; }
.view-user-info .vname { font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); }
.view-user-info .vrole { font-size: 0.6rem; color: var(--color-text-light); font-weight: 700; text-transform: uppercase; }

.view-sidebar { display: flex; flex-direction: column; gap: 2rem; }
.meta-card { background: var(--color-bg-main); padding: 2rem; border-radius: 20px; display: flex; flex-direction: column; gap: 2rem; }
.meta-item { display: flex; flex-direction: column; gap: 0.75rem; }
.m-label { font-size: 0.75rem; font-weight: 700; color: var(--color-text-light); text-transform: uppercase; letter-spacing: 0.05em; }

.timeline-box { display: flex; flex-direction: column; gap: 1rem; background: var(--color-bg-card); padding: 1rem; border-radius: 12px; border: 1px solid var(--color-border); }
.t-date { display: flex; flex-direction: column; gap: 0.15rem; }
.t-lbl { font-size: 0.6rem; color: var(--color-text-light); text-transform: uppercase; }
.t-date strong { font-size: 0.85rem; color: var(--color-text-primary); }
.t-divider { height: 1px; background: var(--color-border-light); }

.owner-pill { display: flex; align-items: center; gap: 0.75rem; background: var(--color-bg-card); padding: 0.5rem 1rem; border-radius: 50px; border: 1px solid var(--color-border); align-self: flex-start; }
.owner-pill img { width: 24px; height: 24px; border-radius: 50%; }
.owner-pill span { font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); }

.stats-card { background: var(--color-text-primary); padding: 2rem; border-radius: 20px; color: var(--color-bg-main); display: flex; justify-content: center; }
.stat-box { display: flex; flex-direction: column; align-items: center; }
.s-val { font-size: 2.5rem; font-weight: 900; line-height: 1; }
.s-lbl { font-size: 0.75rem; font-weight: 600; color: var(--color-bg-main); opacity: 0.8; text-transform: uppercase; margin-top: 0.5rem; }

.view-footer { justify-content: flex-start !important; padding: 1.5rem 3rem !important; gap: 1rem; }
.flex-spacer { flex: 1; }

.btn-delete-ghost {
  background: transparent;
  border: 1.5px solid #FEE2E2;
  color: #EF4444;
  padding: 0.85rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-delete-ghost:hover {
  background: #FEF2F2;
  border-color: #EF4444;
}

.btn-start-action {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px color-mix(in srgb, var(--primary-color) 30%, transparent);
}

.btn-start-action:hover {
  filter: brightness(0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px color-mix(in srgb, var(--primary-color) 35%, transparent);
}

/* Delete Confirmation Modal Styles */
.danger-overlay { background: rgba(127, 29, 29, 0.4); }
.warning-overlay { background: rgba(245, 158, 11, 0.2); }

.confirm-modal-container {
  background: white;
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: confirmIn 0.2s ease-out;
}

.warning-container {
  border-top: 6px solid #F59E0B;
}

@keyframes confirmIn {
  from { transform: scale(0.9) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.confirm-icon {
  width: 64px;
  height: 64px;
  background: #FEE2E2;
  color: #EF4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.warning-icon {
  background: #FEF3C7;
  color: #F59E0B;
}

.confirm-modal-container h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin-bottom: 0.75rem;
}

.confirm-modal-container p {
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
}

.confirm-actions button {
  flex: 1;
}

.btn-confirm-delete {
  background: #EF4444;
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirm-delete:hover { background: #DC2626; }

/* Sprint Activation Specifics */
.success-anim-overlay { background: var(--primary-color); z-index: 2000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.animation-content { text-align: center; color: white; animation: slideUpFade 0.5s ease-out; }
.rocket-wrapper { margin-bottom: 2rem; animation: rocketFly 2s infinite ease-in-out; }

@keyframes rocketFly {
  0% { transform: translateY(0) rotate(0); }
  25% { transform: translateY(-10px) rotate(5deg); }
  75% { transform: translateY(10px) rotate(-5deg); }
  100% { transform: translateY(0) rotate(0); }
}

@keyframes slideUpFade {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.btn-confirm-start {
  background: var(--primary-color); color: white; border: none; padding: 0.85rem 1.5rem; 
  border-radius: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 10px color-mix(in srgb, var(--primary-color) 30%, transparent);
}
.btn-confirm-start:hover { filter: brightness(0.9); transform: scale(1.05); }
.btn-cancel-flat { background: transparent; border: none; color: #64748B; font-weight: 700; cursor: pointer; padding: 0.85rem 1.5rem; }

.item-actions { position: relative; }
.action-menu-btn { background: none; border: none; padding: 0.25rem; cursor: pointer; color: var(--color-text-muted); display: flex; align-items: center; justify-content: center; }
.action-menu-btn:hover { color: var(--color-text-primary); }
.action-dropdown { position: absolute; right: 0; top: 100%; background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; min-width: 150px; }
.dropdown-item { width: 100%; text-align: left; background: none; border: none; padding: 0.75rem 1rem; cursor: pointer; color: var(--color-text-primary); font-size: 0.85rem; }
.dropdown-item:hover { background: var(--color-bg-main); color: var(--color-danger); }

/* Custom Dropdowns */
.custom-dropdown { position: relative; cursor: pointer; }
.dropdown-trigger { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: white; border-radius: 6px; font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.1); white-space: nowrap; }
.dropdown-trigger:hover { background: #f8f9fa; }
.dropdown-menu { position: absolute; top: 100%; left: 0; margin-top: 4px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 150px; z-index: 100; overflow: hidden; }
.dropdown-menu .dropdown-item { padding: 0.65rem 1rem; cursor: pointer; color: var(--color-text-primary); font-size: 0.85rem; }
.dropdown-menu .dropdown-item:hover { background: var(--color-bg-main); color: var(--primary-color); }
.dropdown-menu .dropdown-item.danger { color: var(--color-danger); }
.dropdown-menu .dropdown-item.danger:hover { background: color-mix(in srgb, var(--color-danger) 10%, transparent); color: var(--color-danger); }

</style>
