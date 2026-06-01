/**
 * Menu item configuration interface
 * Supports multi-level nested menu items
 */
export interface MenuItemConfig {
  /** Unique identifier for the menu item */
  id?: string

  /** Display title */
  title: string

  /** Route path (optional for parent items) */
  path?: string

  /** Icon component name or component itself */
  icon?: string | any

  /** Child menu items for multi-level menus */
  children?: MenuItemConfig[]

  /** Display order (lower numbers appear first) */
  order?: number

  /** Required permission or permissions to view this menu item (optional) */
  permission?: string | string[]

  /** Alternative field for declaring multiple required permissions */
  permissions?: string[]

  /** Additional metadata */
  meta?: Record<string, any>
}

/**
 * Package menu configuration
 * Used for registering package menus with the menu registry
 */
export interface PackageMenuConfig {
  /** Package name */
  packageName: string

  /** Menu configuration */
  menu: MenuItemConfig
}

/**
 * Menu Builder Class
 * Builders extend this class to construct menu items dynamically
 */
export abstract class MenuBuilder {
  /**
   * Build the menu structure
   * @param menu - Current menu configuration
   * @param menuName - Name of the menu being built
   * @returns Updated menu configuration
   */
  abstract build(menu: MenuItemConfig, menuName: string): MenuItemConfig

  /**
   * Add a menu item to the configuration
   * @param menu - Target menu configuration
   * @param item - Item to add
   */
  addMenuItem(menu: MenuItemConfig, item: MenuItemConfig): void {
    if (!menu.children) {
      menu.children = []
    }
    menu.children.push(item)
  }
}
