// ============================================================
// DATA.JS — Dữ liệu 5 làng nghề Việt Nam có ảnh 360 độ (VR)
// Cập nhật: Thêm historyQuestions và tours
// ============================================================

const VILLAGES = [
  {
    id: 1,
    name: "Gốm Bát Tràng",
    location: "Gia Lâm, Hà Nội",
    region: "mien-bac",
    category: "gom-su",
    thumbnail: "images/lang-gom-bat-trang-1.jpg",
    description: "Làng gốm có lịch sử hơn 500 năm, nổi tiếng với các sản phẩm gốm sứ tinh xảo, đậm đà bản sắc dân tộc.",
    funFact: "Gạch Bát Tràng từng được dùng để xây dựng Kinh thành Thăng Long.",
    established: "Thế kỷ 15",
    specialty: "Gốm sứ, đồ thờ cúng, gốm trang trí",
    clues: [
      "Làng nghề này nằm ở huyện Gia Lâm, thủ đô Hà Nội",
      "Có tuổi đời hơn 500 năm lịch sử",
      "Câu ca dao: 'Ước gì anh lấy được nàng / Để anh mua gạch... xây nhà'",
      "Sản phẩm chính của làng là gốm sứ tinh xảo"
    ],
    video: "https://www.youtube-nocookie.com/embed/o6B9e6NlGbE?playsinline=1&rel=0",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1778986920879!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJQ0dwOWlnNmdF!2m2!1d20.97889063302469!2d105.916034568623!3f80!4f0!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p1_1", name: "Bộ ấm chén cao cấp vẽ vinh quy bái tổ", artisan: "Nghệ nhân Bát Tràng", price: 1550000, image: "https://gomsubattrang.com/Images/SanPham/MKC_bo-am-chen-cao-cap-bat-trang-ve-vinh-quy-bai-to.jpg", desc: "Bộ ấm chén cao cấp Bát Tràng vẽ tay họa tiết vinh quy bái tổ truyền thống." },
      { id: "p1_2", name: "Bộ ấm chén men hoàng kim sa", artisan: "Nghệ nhân Trần Độ", price: 2200000, image: "https://gomsubattrang.com/Images/sanpham/zfh-bo-am-chen-men-hoang-kim-sa-bat-trang-2.jpg", desc: "Bộ ấm chén men hoàng kim sa Bát Tràng sang trọng, vẽ tay chi tiết." },
      { id: "p1_3", name: "Bộ ấm chén cao cấp vẽ hoa mai", artisan: "Nghệ nhân Vương Quốc", price: 1850000, image: "https://gomsubattrang.com/Images/sanpham/ooa-bo-am-chen-cao-cap-ve-hoa-mai-trang.jpg", desc: "Ấm chén sứ Bát Tràng vẽ hoa mai trắng tinh khôi, giữ nhiệt cực tốt." },
      { id: "p1_4", name: "Đôi lọ lộc bình đắp nổi phú quý mãn đường", artisan: "Nghệ nhân Bát Tràng", price: 15000000, image: "https://gomsubattrang.com/Images/SanPham/BBZ_lo-luc-binh-dap-noi-cao-cap-bat-trang-de-tai-phu-quy-man-duong.jpg", desc: "Đôi lọ lộc bình đắp nổi cao cấp Bát Tràng đề tài phú quý mãn đường." },
    ],
    tours: [
      { id: "t1_1", name: "Trải nghiệm làm thợ gốm Bát Tràng", duration: "Nửa ngày", price: 350000, image: "images/tour_battrang_1_1779167493060.png", desc: "Tự tay vuốt nặn, tô tượng và nung gốm mang về làm kỷ niệm. Bao gồm vé tham quan bảo tàng gốm." },
      { id: "t1_2", name: "Tour văn hóa Làng Gốm & Ẩm thực", duration: "1 Ngày", price: 850000, image: "images/tour_battrang_2_1779167515003.png", desc: "Khám phá ngõ ngách làng cổ, thăm xưởng nghệ nhân nổi tiếng và thưởng thức mâm cỗ truyền thống Bát Tràng." }
    ],
    historyQuestions: [
      { q: "Làng gốm Bát Tràng được hình thành vào khoảng thời gian nào?", options: ["Thời Lý", "Thời Trần", "Thời Hậu Lê", "Thời Nguyễn"], answer: 0 },
      { q: "Loại đất nào là nguyên liệu chính đặc trưng để làm gốm Bát Tràng xưa?", options: ["Đất sét vàng", "Đất sét trắng", "Đất đỏ bazan", "Đất phù sa"], answer: 1 },
      { q: "Kỹ thuật men nào là độc bản nổi tiếng nhất của Bát Tràng?", options: ["Men ngọc", "Men lam", "Men rạn", "Men nâu"], answer: 2 },
      { q: "Gạch Bát Tràng từng được dùng để xây dựng công trình nổi tiếng nào?", options: ["Kinh thành Huế", "Hoàng thành Thăng Long", "Thành nhà Hồ", "Lăng Cô Chủ Tịch"], answer: 1 },
      { q: "Nhiệt độ nung trung bình của gốm sứ Bát Tràng là bao nhiêu?", options: ["800 - 900 độ C", "1000 - 1100 độ C", "1200 - 1300 độ C", "1400 - 1500 độ C"], answer: 2 },
      { q: "Công đoạn nào quan trọng nhất quyết định hình dáng sản phẩm gốm?", options: ["Chọn đất", "Vuốt gốm (Tạo hình)", "Tráng men", "Nung gốm"], answer: 1 },
      { q: "Dòng men rạn cổ Bát Tràng được phục hồi vào thế kỷ nào?", options: ["Thế kỷ 18", "Thế kỷ 19", "Thế kỷ 20", "Thế kỷ 21"], answer: 2 },
      { q: "Nghề gốm Bát Tràng có nguồn gốc từ đâu chuyển đến?", options: ["Làng Bồ Bát (Ninh Bình)", "Làng Chu Đậu (Hải Dương)", "Làng Phù Lãng (Bắc Ninh)", "Làng Hương Canh (Vĩnh Phúc)"], answer: 0 },
      { q: "Lò nung gốm truyền thống phổ biến nhất ngày xưa ở Bát Tràng gọi là gì?", options: ["Lò gas", "Lò bầu", "Lò hộp", "Lò điện"], answer: 1 },
      { q: "Đặc điểm nào sau đây KHÔNG phải của gốm Bát Tràng?", options: ["Làm thủ công", "Nung ở nhiệt độ thấp", "Họa tiết đậm chất dân gian", "Cốt gốm dày dặn"], answer: 1 }
    ]
  },
  {
    id: 2,
    name: "Lụa Vạn Phúc",
    location: "Hà Đông, Hà Nội",
    region: "mien-bac",
    category: "det-lua",
    thumbnail: "images/Lụa vạn phúc.jpg",
    description: "Làng nghề dệt lụa tơ tằm truyền thống, sản phẩm từng được chọn để may quốc phục dưới triều Nguyễn.",
    funFact: "Lụa Vạn Phúc từng được giới thiệu tại hội chợ quốc tế Marseille (Pháp) năm 1931.",
    established: "Hơn 1000 năm",
    specialty: "Lụa tơ tằm, gấm",
    clues: [
      "Làng nghề nằm bên dòng sông Nhuệ, thuộc quận Hà Đông",
      "Sản phẩm từng được dùng để may quốc phục triều Nguyễn",
      "Có bộ phim điện ảnh nổi tiếng mang tên 'Áo lụa...'",
      "Đặc sản của làng là lụa tơ tằm mềm mại"
    ],
    video: "https://www.youtube-nocookie.com/embed/1uLOa8oDBP0?playsinline=1&rel=0",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1778987290766!6m8!1m7!1sJuwEgQFlEqxzsA2QSH4tTw!2m2!1d20.97938475928094!2d105.7734039812194!3f339.86737!4f0!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p2_1", name: "Khăn lụa vẽ tay thủ công cao cấp", artisan: "Nghệ nhân Vạn Phúc", price: 850000, image: "https://luavanvanphuc.com/watermarks/352x352x1/upload/product/102001691317097262318-1775577534.jpg.webp", desc: "Khăn lụa vẽ tay thủ công 100% tơ tằm tự nhiên, họa tiết độc bản." },
      { id: "p2_2", name: "Khăn lụa nhăn nhuộm loang tự nhiên", artisan: "Xưởng lụa Vạn Phúc", price: 450000, image: "images/khan_lua_nhan_ai.png", desc: "Khăn lụa nhăn nhuộm màu loang tự nhiên, siêu mềm mịn." },
      { id: "p2_3", name: "Cà vạt lụa tơ tằm cao cấp", artisan: "Nghệ nhân Vạn Phúc", price: 350000, image: "https://luavanvanphuc.com/watermarks/352x352x1/upload/product/z6750308916537eaf9346b7ea56bc976d366cfca51bb44-1751112228.jpg.webp", desc: "Cà vạt 100% lụa tơ tằm nguyên chất, họa tiết chìm sang trọng." },
      { id: "p2_4", name: "Vải lụa Satin tơ tằm (1m)", artisan: "Làng lụa Vạn Phúc", price: 400000, image: "https://luavanvanphuc.com/watermarks/352x352x1/upload/product/z67783118455700b591033e5ada2693d20920a13e8012f-1762050368.jpg.webp", desc: "Vải lụa satin bóng mượt, chuyên may áo dài cao cấp." }
    ],
    tours: [
      { id: "t2_1", name: "Hành trình tơ lụa ngàn năm", duration: "Nửa ngày", price: 250000, image: "images/tour_vanphuc_1779167555678.png", desc: "Tìm hiểu quy trình trồng dâu, nuôi tằm, ươm tơ, dệt lụa. Mặc thử trang phục áo dài lụa truyền thống." }
    ],
    historyQuestions: [
      { q: "Làng lụa Vạn Phúc nằm bên bờ con sông nào?", options: ["Sông Hồng", "Sông Đáy", "Sông Nhuệ", "Sông Tô Lịch"], answer: 2 },
      { q: "Bà tổ nghề lụa Vạn Phúc là ai?", options: ["Bà Chúa Kho", "Bà Ả Lã Đê Nương", "Bà Triệu", "Công chúa Tiên Dung"], answer: 1 },
      { q: "Loại lụa cao cấp nhất của Vạn Phúc, hoa văn chìm nổi tinh tế gọi là gì?", options: ["Lụa satin", "Lụa vân", "Lụa đũi", "Lụa the"], answer: 1 },
      { q: "Lụa Vạn Phúc từng tham gia hội chợ quốc tế nào năm 1931?", options: ["Hội chợ Paris", "Hội chợ Marseille", "Hội chợ London", "Hội chợ Milan"], answer: 1 },
      { q: "Bước đầu tiên trong quy trình làm lụa là gì?", options: ["Ươm tơ", "Trồng dâu nuôi tằm", "Dệt vải", "Nhuộm màu"], answer: 1 },
      { q: "Nhạc cụ nào thường gắn liền với âm thanh của làng lụa?", options: ["Tiếng sáo", "Tiếng thoi đưa", "Tiếng đàn tranh", "Tiếng trống"], answer: 1 },
      { q: "Màu nhuộm truyền thống của lụa Vạn Phúc chủ yếu lấy từ đâu?", options: ["Hóa chất", "Khoáng sản", "Rễ cây, lá cây (tự nhiên)", "Vỏ sò"], answer: 2 },
      { q: "Lụa Vạn Phúc từng được dùng may quốc phục cho triều đại nào?", options: ["Triều Lý", "Triều Lê", "Triều Nguyễn", "Triều Trần"], answer: 2 },
      { q: "Sợi tơ tằm có đặc tính nổi bật nào?", options: ["Mát mẻ mùa hè, ấm áp mùa đông", "Chống cháy", "Không thấm nước", "Chống đạn"], answer: 0 },
      { q: "Hoa văn trên lụa Vạn Phúc thường mang ý nghĩa gì?", options: ["Phong thủy, cầu may mắn, trường thọ", "Các câu chuyện cổ tích", "Sự tích anh hùng", "Không mang ý nghĩa gì"], answer: 0 }
    ]
  },
  {
    id: 3,
    name: "Chiếu cói Nga Sơn",
    location: "Nga Sơn, Thanh Hóa",
    region: "mien-bac",
    category: "det-chieu",
    thumbnail: "images/chieu_coi_nga_son.png",
    description: "Nổi tiếng qua câu ca dao 'Chiếu Nga Sơn, gạch Bát Tràng'. Dệt những lá chiếu cói hoa văn sắc nét, từng là vật phẩm tiến vua thời phong kiến.",
    funFact: "Sợi cói Nga Sơn có đặc điểm nhỏ, dài, mềm dẻo và óng mượt hơn cói vùng khác do được trồng trên vùng đất lấn biển.",
    established: "Hơn 150 năm",
    specialty: "Chiếu cói hoa, chiếu trơn",
    clues: [
      "Sản phẩm được nhắc đến cùng với gạch Bát Tràng trong ca dao",
      "Làm từ một loại cây mọc nhiều ở vùng ven biển ngập mặn",
      "Nằm tại một huyện ven biển của tỉnh Thanh Hóa",
      "Gắn liền với sự tích Từ Thức gặp tiên"
    ],
    video: "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D2034993820751003&show_text=false",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1715915220261!6m8!1m7!1sDUwiOS_2gT7DHpV4y0sX9A!2m2!1d20.0069578!2d106.0003452!3f12.95!4f10!5f75" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p3_1", name: "Chiếu cói Nga Sơn 180 x 200 cm", artisan: "Không", price: 1400000, image: "https://chieucoi.com.vn/wp-content/uploads/2017/06/20190825_075039-300x250.jpg", desc: "Chiếu cói dệt tay thủ công 100% sợi cói tự nhiên Nga Sơn. Hàng chất lượng cao loại 1." },
      { id: "p3_2", name: "Chiếu cói Nga Sơn 160 x 200 cm", artisan: "Không", price: 1000000, image: "https://chieucoi.com.vn/wp-content/uploads/2022/05/155-300x250.jpg", desc: "Chiếu cói trắng loại dày dặn, viền vải dù chắc chắn." },
      { id: "p3_3", name: "Chiếu cói Nga Sơn 150 x 190 cm", artisan: "Không", price: 600000, image: "https://chieucoi.com.vn/wp-content/uploads/2022/05/20190825_075333-300x250.jpg", desc: "Chiếu cói Nga Sơn kích thước tiêu chuẩn, phù hợp giường đơn rộng." },
      { id: "p3_4", name: "Chiếu cói Nga Sơn 140 x 190 cm", artisan: "Không", price: 550000, image: "https://chieucoi.com.vn/wp-content/uploads/2017/06/160-300x300.jpg", desc: "Chiếu cói trắng, sợi nhỏ dệt khít, dùng rất mát vào mùa hè." }
    ],
    tours: [
      { id: "t3_1", name: "Khám phá xứ Cói & Động Từ Thức", duration: "1 Ngày", price: 650000, image: "images/tour_ngason_1779167572482.png", desc: "Tham gia thu hoạch cói, học cách dệt chiếu truyền thống và tham quan động Từ Thức huyền bí." }
    ],
    historyQuestions: [
      { q: "Nga Sơn là một huyện ven biển thuộc tỉnh nào?", options: ["Ninh Bình", "Nghệ An", "Thanh Hóa", "Nam Định"], answer: 2 },
      { q: "Câu ca dao nổi tiếng nào nhắc đến chiếu Nga Sơn?", options: ["Chiếu Nga Sơn, gạch Bát Tràng", "Chiếu Nga Sơn, nón Bài Thơ", "Chiếu Nga Sơn, lụa Vạn Phúc", "Chiếu Nga Sơn, gốm Thanh Hà"], answer: 0 },
      { q: "Cây cói phát triển tốt nhất ở môi trường đất nào?", options: ["Đất đỏ bazan", "Đất chua phèn, ngập mặn", "Đất đồi núi", "Đất cát sa mạc"], answer: 1 },
      { q: "Sợi cói Nga Sơn có ưu điểm gì so với vùng khác?", options: ["Rất cứng và to", "Sợi nhỏ, dai, mềm mại, óng mượt", "Có mùi thơm hoa hồng", "Nhiều màu sắc tự nhiên"], answer: 1 },
      { q: "Loại chiếu nào của Nga Sơn thường có họa tiết chữ Thọ, hoa sen?", options: ["Chiếu trơn", "Chiếu in hoa", "Chiếu đậu", "Chiếu trúc"], answer: 1 },
      { q: "Công đoạn nào khó nhất trong nghề dệt chiếu?", options: ["Chẻ cói", "Phơi cói", "Dệt chiếu (Bắt mép, gõ go)", "Nhuộm cói"], answer: 2 },
      { q: "Nga Sơn còn gắn liền với sự tích nổi tiếng nào?", options: ["Sơn Tinh Thủy Tinh", "Từ Thức gặp Tiên", "Trọng Thủy Mỵ Châu", "Thạch Sanh"], answer: 1 },
      { q: "Chiếu Nga Sơn từng là vật phẩm để làm gì thời xưa?", options: ["Làm quà tặng ngoại giao", "Tiến vua", "Làm buồm cho tàu", "Xuất khẩu sang châu Âu"], answer: 1 },
      { q: "Cói sau khi chẻ cần được làm gì trước khi dệt?", options: ["Phơi nắng", "Luộc chín", "Ủ chua", "Ngâm muối"], answer: 0 },
      { q: "Chiếu cói mang lại lợi ích gì cho sức khỏe người dùng?", options: ["Chữa bách bệnh", "Giữ nhiệt vào mùa hè", "Thoáng mát, thấm hút mồ hôi tốt", "Trị bệnh mất ngủ hoàn toàn"], answer: 2 }
    ]
  },
  {
    id: 4,
    name: "Gốm Thanh Hà",
    location: "Hội An, Quảng Nam",
    region: "mien-trung",
    category: "gom-su",
    thumbnail: "images/Gốm thanh hà.jpg",
    description: "Làng gốm cổ nằm ven sông Thu Bồn, nổi tiếng với các sản phẩm gốm đất nung không tráng men mộc mạc.",
    funFact: "Gạch ngói của làng Thanh Hà từng được dùng để lợp mái cho các ngôi nhà cổ ở Hội An.",
    established: "Thế kỷ 15",
    specialty: "Gốm đất nung, tò he, ngói âm dương",
    clues: [
      "Làng nghề nằm ngay cạnh phố cổ Di sản Văn hóa Thế giới",
      "Nằm êm đềm bên dòng sông Thu Bồn",
      "Đặc trưng là gốm đất nung màu đỏ gạch, không tráng men",
      "Có tên là gốm Thanh ..."
    ],
    video: "https://www.youtube-nocookie.com/embed/Hg-D8n2QdJQ?playsinline=1&rel=0",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1778987488279!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJRGp0UE9hNHdF!2m2!1d15.87717948614401!2d108.2992130416365!3f359.88742!4f0!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p4_1", name: "Tò he đất nung Thanh Hà", artisan: "Nghệ nhân Làng Thanh Hà", price: 50000, image: "images/to_he_dat_ai.png", desc: "Đồ chơi dân gian bằng gốm đất nung, hình con giáp, thổi kêu vui tai." },
      { id: "p4_2", name: "Bình hoa gốm mộc Thanh Hà", artisan: "Xưởng gốm Thanh Hà", price: 150000, image: "images/binh_hoa_gom_ai.png", desc: "Bình hoa đất nung không tráng men, kiểu dáng thô mộc tự nhiên." },
      { id: "p4_3", name: "Bộ trà gốm mộc đỏ", artisan: "Nghệ nhân Làng Thanh Hà", price: 350000, image: "images/bo_tra_gom_ai.png", desc: "Bộ ấm trà làm từ đất sét sông Thu Bồn nung đỏ tự nhiên." }
    ],
    tours: [
      { id: "t4_1", name: "Vuốt gốm Thanh Hà & Phố cổ", duration: "Nửa ngày", price: 300000, image: "images/tour_thanhha_1779167591598.png", desc: "Dạo chơi công viên đất nung Thanh Hà, tự tay làm tò he con giáp và dạo phố cổ Hội An." }
    ],
    historyQuestions: [
      { q: "Làng gốm Thanh Hà nằm bên bờ con sông nào?", options: ["Sông Hương", "Sông Hàn", "Sông Thu Bồn", "Sông Trà Khúc"], answer: 2 },
      { q: "Gốm Thanh Hà có đặc trưng nổi bật nhất là gì?", options: ["Tráng men lam", "Không tráng men, đất nung mộc", "Khảm trai", "Vẽ vàng"], answer: 1 },
      { q: "Gạch ngói âm dương của Thanh Hà từng được sử dụng để xây dựng công trình nào?", options: ["Nhà cổ Hội An", "Cố đô Huế", "Tháp Chăm", "Kinh thành Thăng Long"], answer: 0 },
      { q: "Món đồ chơi dân gian bằng gốm phát ra âm thanh của Thanh Hà gọi là gì?", options: ["Diều sáo", "Tò he đất nung", "Kèn lá", "Trống bỏi"], answer: 1 },
      { q: "Công cụ tạo hình gốm truyền thống ở Thanh Hà là gì?", options: ["Bàn xoay bằng chân", "Khuôn đúc nhựa", "Máy in 3D", "Bàn xoay máy"], answer: 0 },
      { q: "Làng Thanh Hà được hình thành vào khoảng thế kỷ nào?", options: ["Thế kỷ 10", "Thế kỷ 12", "Thế kỷ 15", "Thế kỷ 19"], answer: 2 },
      { q: "Màu sắc tự nhiên của gốm Thanh Hà sau khi nung chủ yếu là màu gì?", options: ["Trắng tinh", "Xanh ngọc", "Đỏ gạch, đỏ hồng", "Đen nhánh"], answer: 2 },
      { q: "Người dân Thanh Hà thường dùng củi gì để nung gốm tạo nhiệt độ đều?", options: ["Củi thông", "Củi tạp, lá khô", "Than đá", "Dầu hỏa"], answer: 1 },
      { q: "Nơi tôn vinh các tác phẩm nghệ thuật gốm đương đại tại đây có tên là gì?", options: ["Bảo tàng Louvre", "Công viên Đất nung Thanh Hà", "Triển lãm Mỹ thuật", "Nhà hát Lớn"], answer: 1 },
      { q: "Đất sét làm gốm Thanh Hà được lấy từ đâu?", options: ["Khai thác trên núi", "Múc từ lòng sông Thu Bồn", "Nhập khẩu từ nơi khác", "Dùng đất sét nhân tạo"], answer: 1 }
    ]
  },
  {
    id: 5,
    name: "Đá mỹ nghệ Non Nước",
    location: "Ngũ Hành Sơn, Đà Nẵng",
    region: "mien-trung",
    category: "dieu-khac",
    thumbnail: "images/tuong-da-lang-my-nghe-non-nuoc.png",
    description: "Làng nghề chạm khắc đá dưới chân núi Ngũ Hành Sơn với các tuyệt tác tượng Phật, linh vật.",
    funFact: "Nguyên liệu đá cẩm thạch ban đầu được khai thác ngay tại núi Ngũ Hành Sơn.",
    established: "Thế kỷ 17",
    specialty: "Điêu khắc đá cẩm thạch",
    clues: [
      "Làng nghề nằm ngay dưới chân danh thắng Ngũ Hành Sơn",
      "Thuộc thành phố được mệnh danh là 'đáng sống nhất Việt Nam'",
      "Nguyên liệu làm ra sản phẩm thường là khối đá cẩm thạch",
      "Có tên là Non..."
    ],
    video: "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F4114791715450442&show_text=false",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1778987653616!6m8!1m7!1sr2fnjB3nOkoLO1IF85ANcw!2m2!1d16.00212397610592!2d108.2633006239604!3f34.24348!4f0!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p5_1", name: "Tượng tiểu đồng bằng đá", artisan: "Nghệ nhân Non Nước", price: 1500000, image: "images/statue_baby_buddha_1782890421574.png", desc: "Tượng tiểu đồng ngây thơ, đáng yêu, điêu khắc thủ công cẩn thận, cao 30cm." },
      { id: "p5_2", name: "Tượng Phật Di Lặc trang trí bàn", artisan: "Xưởng điêu khắc Non Nước", price: 1800000, image: "images/statue_laughing_buddha_1782890432205.png", desc: "Tượng Di Lặc hoan hỉ, mang lại tài lộc ấm no, kích thước nhỏ gọn phù hợp để bàn." },
      { id: "p5_3", name: "Tượng chú tiểu cầm trái đào", artisan: "Nghệ nhân Non Nước", price: 1200000, image: "images/statue_little_monk_1782890443211.png", desc: "Tượng chú tiểu dâng đào tiên, bình an và thanh tịnh." },
      { id: "p5_4", name: "Cặp Thiềm Thừ (Cóc ngậm tiền) mini", artisan: "Làng đá Non Nước", price: 950000, image: "images/thiem_thu_da_ai.png", desc: "Cóc ba chân chiêu tài lộc từ đá ngọc bích tự nhiên bản nhỏ gọn." }
    ],
    tours: [
      { id: "t5_1", name: "Hành hương Ngũ Hành Sơn & Làng Đá", duration: "1 Ngày", price: 450000, image: "images/tour_nonnuoc_1779167714965.png", desc: "Leo núi Ngũ Hành Sơn thăm chùa chiền hang động, sau đó tham quan xưởng chế tác đá Non Nước." }
    ],
    historyQuestions: [
      { q: "Làng đá Non Nước nằm dưới chân ngọn núi nổi tiếng nào?", options: ["Núi Bà Đen", "Núi Ngũ Hành Sơn", "Núi Sơn Trà", "Núi Yên Tử"], answer: 1 },
      { q: "Nguyên liệu đá chủ yếu được sử dụng tại làng nghề này là gì?", options: ["Đá thạch anh", "Đá vôi", "Đá cẩm thạch", "Đá ong"], answer: 2 },
      { q: "Người có công khai sáng nghề đá Non Nước là ai?", options: ["Ông Huỳnh Bá Quát", "Ông Lỗ Ban", "Ông tổ nghề gốm", "Bà Huyện Thanh Quan"], answer: 0 },
      { q: "Làng đá Non Nước thuộc thành phố nào?", options: ["Huế", "Đà Nẵng", "Hội An", "Quy Nhơn"], answer: 1 },
      { q: "Quá trình hoàn thiện một bức tượng đá không bao gồm công đoạn nào?", options: ["Đục phôi", "Nung trong lò", "Đánh bóng", "Chạm nét chi tiết"], answer: 1 },
      { q: "Đá cẩm thạch xưa kia được khai thác trực tiếp từ đâu?", options: ["Nhập khẩu từ nước ngoài", "Ngay tại núi Ngũ Hành Sơn", "Tây Bắc", "Từ đáy biển"], answer: 1 },
      { q: "Sản phẩm nào không phổ biến tại làng đá Non Nước?", options: ["Tượng Phật", "Vòng tay đá", "Tượng linh vật", "Trang phục dệt"], answer: 3 },
      { q: "Công cụ đục đá truyền thống được làm từ gì?", options: ["Gỗ", "Thép", "Đồng", "Nhựa"], answer: 1 },
      { q: "Màu sắc đá cẩm thạch Ngũ Hành Sơn đa dạng do đâu?", options: ["Nhuộm màu", "Các khoáng chất tự nhiên", "Phun sơn", "Phản chiếu ánh sáng"], answer: 1 },
      { q: "Làng nghề đá Non Nước được hình thành vào thế kỷ nào?", options: ["Thế kỷ 15", "Thế kỷ 17", "Thế kỷ 19", "Thế kỷ 20"], answer: 1 }
    ]
  },
  {
    id: 6,
    name: "Mây tre đan Phú Vinh",
    location: "Chương Mỹ, Hà Nội",
    region: "mien-bac",
    category: "may-tre-dan",
    thumbnail: "images/Làng nghề mây tre đan.jpg",
    description: "Làng nghề mây tre đan truyền thống tại Phú Vinh, huyện Chương Mỹ với những sản phẩm thủ công mỹ nghệ tinh xảo từ mây, tre, giang, nứa.",
    funFact: "Sản phẩm mây tre đan của Phú Vinh không chỉ phục vụ trong nước mà còn xuất khẩu đi nhiều quốc gia trên thế giới.",
    established: "Hàng trăm năm",
    specialty: "Rổ, rá, thúng, đồ trang trí mây tre",
    clues: [
      "Nằm ở Phú Vinh, huyện Chương Mỹ, Hà Nội",
      "Nguyên liệu chính là mây, tre, giang, nứa",
      "Sản phẩm rất gần gũi với đời sống nông thôn Việt Nam như rổ, rá...",
      "Có tên là làng nghề Mây tre đan..."
    ],
    video: "https://www.youtube-nocookie.com/embed/FBmeBeAIFLQ?playsinline=1&rel=0",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1778986920879!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJQ0dwOWlnNmdF!2m2!1d20.97889063302469!2d105.916034568623!3f80!4f0!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p6_1", name: "Lẵng hoa mây tre đan tay", artisan: "Nghệ nhân Phú Vinh", price: 150000, image: "images/lang_hoa_may_ai.png", desc: "Lẵng hoa đan tay tinh xảo từ mây tre tự nhiên." },
      { id: "p6_2", name: "Giỏ mây đi picnic vintage", artisan: "Xưởng mây Phú Vinh", price: 450000, image: "images/gio_may_picnic_ai.png", desc: "Giỏ mây tre đan lót vải bọc phong cách cổ điển." },
      { id: "p6_3", name: "Khay mây tre tròn đựng trái cây", artisan: "Nghệ nhân Phú Vinh", price: 200000, image: "images/khay_may_trai_ai.png", desc: "Khay đan tỉ mỉ dùng để trang trí hoặc đựng đồ ăn nhẹ." },
      { id: "p6_4", name: "Chụp đèn mây tre đan thả trần", artisan: "Xưởng mây Phú Vinh", price: 350000, image: "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&q=80&w=800", desc: "Chụp đèn trang trí nội thất phong cách rustic tự nhiên." }
    ],
    tours: [
      { id: "t6_1", name: "Workshop đan mây tre cùng nghệ nhân", duration: "Nửa ngày", price: 400000, image: "images/tour_ngason_1779167572482.png", desc: "Tham quan làng nghề Phú Vinh thanh bình, học cách đan một giỏ mây nhỏ đem về." }
    ],
    historyQuestions: [
      { q: "Làng nghề mây tre đan Phú Vinh thuộc huyện nào của Hà Nội?", options: ["Đông Anh", "Chương Mỹ", "Thường Tín", "Thanh Oai"], answer: 1 },
      { q: "Nguyên liệu chính của làng nghề này là gì?", options: ["Gỗ lim", "Mây, tre, giang, nứa", "Lá cọ", "Lục bình"], answer: 1 },
      { q: "Sản phẩm mây tre đan Phú Vinh nổi tiếng vì điều gì?", options: ["Sơn mài bóng loáng", "Kỹ thuật đan tinh xảo, như tơ lụa", "Nặng và bền", "Dễ cháy"], answer: 1 },
      { q: "Sản phẩm nào thường KHÔNG làm từ mây tre đan?", options: ["Rổ, rá", "Khay đựng trái cây", "Áo dài", "Chụp đèn trang trí"], answer: 2 },
      { q: "Quy trình xử lý mây tre chống mối mọt truyền thống thường làm gì?", options: ["Ngâm hóa chất độc hại", "Ngâm dưới ao bùn, hun khói", "Quét sơn dầu", "Sấy bằng lò điện"], answer: 1 },
      { q: "Thị trường xuất khẩu chính của mây tre đan Phú Vinh hiện nay là ở đâu?", options: ["Chỉ tiêu thụ trong nước", "Nhật Bản, Mỹ, Châu Âu", "Nam Cực", "Châu Phi"], answer: 1 },
      { q: "Nghề đan mây tre đòi hỏi người thợ phải có phẩm chất gì cao nhất?", options: ["Sức khỏe phi thường", "Khéo léo, kiên nhẫn, tỉ mỉ", "Biết tính toán giỏi", "Tốc độ cực nhanh"], answer: 1 },
      { q: "Làng Phú Vinh có lịch sử nghề đan cách đây khoảng bao lâu?", options: ["Vài chục năm", "Gần 400 năm", "1000 năm", "Mới thành lập"], answer: 1 },
      { q: "Sản phẩm 'chân dung Bác Hồ' bằng mây tre đan thể hiện điều gì?", options: ["Kỹ thuật đan tạo hình đỉnh cao", "Máy móc hiện đại", "In ấn màu sắc", "Nghề thêu ren"], answer: 0 },
      { q: "Trước khi đan, mây tre phải trải qua công đoạn gì để mềm và dễ uốn?", options: ["Nướng trên lửa lớn", "Chẻ lạt, tuốt sợi", "Cắt khúc ngắn", "Ép bằng máy dập"], answer: 1 }
    ]
  }
];

const QUESTIONS_BANK = VILLAGES.map(v => ({
  villageId: v.id,
  type: "clue-guess",
  clues: v.clues
}));

function getRandomVillages(count = 6) {
  const shuffled = [...VILLAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getVillageById(id) {
  return VILLAGES.find(v => v.id === id);
}

function getAllProducts() {
  const products = [];
  VILLAGES.forEach(v => {
    (v.products || []).forEach(p => {
      products.push({ ...p, villageName: v.name, villageId: v.id, location: v.location, category: v.category });
    });
  });
  return products;
}

function getProductsByVillage(villageId) {
  const village = getVillageById(villageId);
  return village ? (village.products || []).map(p => ({ ...p, villageName: village.name, location: village.location })) : [];
}

function getProductById(productId) {
  for (const v of VILLAGES) {
    const p = (v.products || []).find(p => p.id === productId);
    if (p) return { ...p, villageName: v.name, villageId: v.id, location: v.location };
  }
  return null;
}

function getAllTours() {
  const tours = [];
  VILLAGES.forEach(v => {
    (v.tours || []).forEach(t => {
      tours.push({ ...t, villageName: v.name, villageId: v.id, location: v.location });
    });
  });
  return tours;
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}
