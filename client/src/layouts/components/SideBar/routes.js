export const roleEnum = {
    Customer: 0,
    Staff: 2,
    Admin: 3
}

export const routes = [
  {
    title: 'Tổng quan',
    path: '/admin',
    exactly: true,
    permissions: [roleEnum.Staff, roleEnum.Admin]

  },
  {
    title: 'Quản lý sách',
    path: '/admin/book',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Quản lý thể loại',
    path: '/admin/genre',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Quản lý tác giả',
    path: '/admin/author',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Quản lý nhà xuất bản',
    path: '/admin/publisher',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Quản lý đơn hàng',
    path: '/admin/order',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Quản lý khuyến mãi',
    path: '/admin/promotion',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Mã giảm giá',
    path: '/admin/voucher',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Khách hàng',
    path: '/admin/customer',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
    title: 'Nhà cung cấp',
    path: '/admin/suppliers',
    permissions: [roleEnum.Staff, roleEnum.Admin]
  },
  {
  title: 'Quản lý kho',
  path: '/admin/stockreceipt',
  permissions: [roleEnum.Admin, roleEnum.Staff]
  },
  {
    title: 'Nhân viên',
    path: '/admin/staff',
    permissions: [roleEnum.Admin]
  },
];