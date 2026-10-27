/* =========================================================
   NỘI DUNG RIÊNG CHO ROUTE NÀY (Nhà Trai)
   Sửa trực tiếp các giá trị bên dưới. Ảnh/nhạc nằm trong thư mục media/ DÙNG CHUNG ở gốc (../media).
   Chỉ cần liệt kê tên file muốn dùng ở album/cover/music bên dưới.
   ========================================================= */
window.WEDDING = {
  side: "Nhà Trai",

  // ----- Thông tin TIỆC CƯỚI -----
  reception: {
    timeTop: "18:00",          // giờ hiển thị ở dòng đầu
    weekday: "THỨ SÁU",
    day: "27",
    monthLabel: "THÁNG 11",
    year: "2026",
    lunar: "(Tức ngày 19 tháng 10 năm Bính Ngọ)",
    welcome: "17:30",          // Đón khách
    start: "18:00",            // Khai tiệc
    // Lịch (tự vẽ): tháng, năm, ngày tô đỏ
    calMonth: 11, calYear: 2026, highlightDay: 27,
    calendarUrl: "https://www.google.com/calendar/render?action=TEMPLATE&text=L%E1%BB%85%20c%C6%B0%E1%BB%9Bi%20Nguy%E1%BB%85n%20Quang%20Long%20%26%20Nguy%E1%BB%85n%20Th%E1%BB%8B%20Minh%20Nguy%E1%BB%87t&dates=20261127T090000Z/20261127T110000Z&ctz=Asia/Ho_Chi_Minh&location=119A%20%C4%90%C6%B0%E1%BB%9Dng%20%C3%82u%20C%C6%A1%2C%20Kinh%20B%E1%BA%AFc%2C%20B%E1%BA%AFc%20Ninh"
  },

  // ----- Địa điểm -----
  venue: {
    address: "Trung Tâm Tiệc Cưới Dolphin Palace\n119A Đường Âu Cơ, phường Kinh Bắc, Bắc Ninh",
    mapQuery: "Dolphin Palace, Âu Cơ, Kinh Bắc, Bắc Ninh",
    directionsQuery: "Nhà hàng Dolphin - Trung tâm Tổ chức sự kiện & Tiệc cưới Dolphin Palace, Bắc Ninh"
  },

  // ----- Lịch trình ngày cưới (thêm/bớt dòng tuỳ ý) -----
  // icon: camera | cake | cook (bỏ trống nếu không cần)
  timeline: [
    { time: "17:00", label: "Đón khách" },
    { time: "18:00", label: "Khai tiệc", icon: "camera" },
    { time: "18:30", label: "Nghi thức cưới", icon: "cake" },
    { time: "19:00", label: "Cắt bánh & nâng ly", icon: "cook" },
    { time: "20:30", label: "Kết thúc tiệc" }
  ],

  // ----- Tài nguyên: chọn file từ media/album (ảnh dùng chung). cover = 1 ảnh trong album -----
  album: ["01.webp","02.webp","03.webp","04.webp","05.webp","06.webp","07.webp","08.webp","09.webp","10.webp","11.webp","12.webp","13.webp","14.webp","15.webp","16.webp","17.webp","18.webp","19.webp","20.webp","21.webp","22.webp","23.webp","24.webp","25.webp","26.webp","27.webp","28.webp","29.webp","30.webp","31.webp","32.webp","33.webp"],
  cover: "04.webp",
  music: "nhac-nen.mp3"
};
