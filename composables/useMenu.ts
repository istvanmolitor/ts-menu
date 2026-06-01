import { computed, unref, type ComputedRef, type MaybeRef } from 'vue'
import { getMenu } from '../config/menuInitializer'
import { menuUpdateTrigger } from '../config/menuRegistry'
import type { MenuItemConfig } from '../types/menu'

const normalizeRequiredPermissions = (item: MenuItemConfig): string[] => {
  const permissionList = Array.isArray(item.permission)
    ? item.permission
    : item.permission
      ? [item.permission]
      : []

  return Array.from(new Set([...permissionList, ...(item.permissions ?? [])]))
}

const canAccessMenuItem = (item: MenuItemConfig, userPermissions: string[]): boolean => {
  const requiredPermissions = normalizeRequiredPermissions(item)

  if (requiredPermissions.length === 0) {
    return true
  }

  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

const filterMenuItemByPermission = (
  item: MenuItemConfig,
  userPermissions: string[],
  keepEmptyParent = false
): MenuItemConfig | undefined => {
  if (!canAccessMenuItem(item, userPermissions)) {
    return undefined
  }

  const filteredChildren = item.children
    ?.map(child => filterMenuItemByPermission(child, userPermissions))
    .filter((child): child is MenuItemConfig => !!child)

  if (!keepEmptyParent && item.children && filteredChildren?.length === 0 && !item.path) {
    return undefined
  }

  return {
    ...item,
    children: filteredChildren ?? item.children
  }
}

/**
 * Composable for accessing a specific menu in components
 * @param menuName - Name of the menu to access
 * @returns Object with menu-related computed properties and methods
 */
export function useMenu(menuName: string, userPermissions?: MaybeRef<string[] | undefined>) {
  const resolvedPermissions: ComputedRef<string[]> = computed(() => unref(userPermissions) ?? [])

  /**
   * The menu configuration
   * Watches menuUpdateTrigger to re-evaluate when menus are registered
   */
  const menu: ComputedRef<MenuItemConfig | undefined> = computed(() => {
    // Access trigger to create dependency
    menuUpdateTrigger.value

    return filterMenuItemByPermission(getMenu(menuName), resolvedPermissions.value, true)
  })

  /**
   * Menu items (children of the menu root)
   */
  const menuItems: ComputedRef<MenuItemConfig[]> = computed(() => {
    return menu.value?.children ?? []
  })

  /**
   * Check if a menu item has children
   */
  const hasChildren = (item: MenuItemConfig): boolean => {
    return !!item.children && item.children.length > 0
  }

  return {
    menu,
    menuItems,
    hasChildren
  }
}
