// ============================================================
// DATA.JS — Dữ liệu 5 làng nghề Việt Nam có ảnh 360 độ (VR)
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
    video: "https://www.youtube.com/embed/ljR0F5J_vPM",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1778986920879!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJQ0dwOWlnNmdF!2m2!1d20.97889063302469!2d105.916034568623!3f80!4f0!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p1", name: "Bình gốm men lam", artisan: "Nghệ nhân Trần Độ", price: 1200000, image: "", desc: "Bình gốm men lam cổ được phục dựng tinh xảo" },
      { id: "p2", name: "Bộ ấm trà tử sa", artisan: "Nghệ nhân Vương Quốc", price: 850000, image: "", desc: "Bộ ấm trà bằng đất tử sa giữ hương vị trà cực tốt" }
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
    video: "https://www.youtube.com/embed/ubxDksPw_lg",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1778987290766!6m8!1m7!1sJuwEgQFlEqxzsA2QSH4tTw!2m2!1d20.97938475928094!2d105.7734039812194!3f339.86737!4f0!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p3", name: "Khăn lụa tơ tằm", artisan: "Nghệ nhân Triệu Văn", price: 450000, image: "", desc: "Khăn lụa 100% tơ tằm tự nhiên, dệt thủ công" }
    ]
  },
  {
    id: 3,
    name: "Chiếu cói Nga Sơn",
    location: "Nga Sơn, Thanh Hóa",
    region: "mien-bac",
    category: "det-chieu",
    thumbnail: "images/Chiếu cói Nga sơn.jpg",
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
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1715915220261!6m8!1m7!1sDUwiOS_2gT7DHpV4y0sX9A!2m2!1d20.0069578!2d106.0003452!3f12.95!4f10!5f75" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p4", name: "Chiếu cói hoa Nga Sơn", artisan: "Nghệ nhân Nguyễn Thị Tình", price: 350000, image: "", desc: "Chiếu cói dệt hoa văn truyền thống, nằm rất mát" }
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
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1778987488279!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJRGp0UE9hNHdF!2m2!1d15.87717948614401!2d108.2992130416365!3f359.88742!4f0!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p5", name: "Tò he đất nung", artisan: "Nghệ nhân Làng Thanh Hà", price: 50000, image: "", desc: "Đồ chơi dân gian bằng gốm có thể thổi kêu tiếng chim" }
    ]
  },
  {
    id: 5,
    name: "Đá mỹ nghệ Non Nước",
    location: "Ngũ Hành Sơn, Đà Nẵng",
    region: "mien-trung",
    category: "dieu-khac",
    thumbnail: "images/tuong-da-lang-my-nghe-non-nuoc.jpg",
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
    video: "https://www.youtube.com/embed/vz0-NhjVTgI",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!4v1778987653616!6m8!1m7!1sr2fnjB3nOkoLO1IF85ANcw!2m2!1d16.00212397610592!2d108.2633006239604!3f34.24348!4f0!5f0.7820865974627469" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p6", name: "Tượng điêu khắc cẩm thạch", artisan: "Nghệ nhân Non Nước", price: 2500000, image: "", desc: "Tượng điêu khắc tinh xảo từ đá cẩm thạch tự nhiên" }
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
    video: "https://www.youtube.com/embed/MW-88Rn9A_0",
    images: [""],
    panorama: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.790515159385!2d105.7511059!3d20.9197926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31344da0df7e59c5%3A0xcda6b0fc14a66a70!2zQsOtY2ggSMOyYSwgVGhhbmggT2FpLCBIw6AgTuG7mWksIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
    products: [
      { id: "p7", name: "Lẵng hoa mây tre", artisan: "Nghệ nhân Phú Vinh", price: 150000, image: "", desc: "Lẵng hoa đan tay tinh xảo từ mây tre tự nhiên" }
    ]
  }
];

const QUESTIONS_BANK = VILLAGES.map(v => ({
  villageId: v.id,
  type: "clue-guess",
  clues: v.clues
}));

function getRandomVillages(count = 6) {
  // Trả về ngẫu nhiên các làng
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

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}
