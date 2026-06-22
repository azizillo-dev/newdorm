const pool = require('../db');
const ExcelJS = require('exceljs');

const getStats = async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toISOString().split('T')[0];
    let floorFilter = '';
    const params = [today];
    let idx = 2;
    // Sardor uchun statistika o'z qavati, lekin floor stats hammasi
    if (user.role === 'sardor') {
      floorFilter = ` AND f.floor_number = $${idx++}`;
      params.push(user.floor_number);
    }

    const todayStats = await pool.query(
      `SELECT
       COUNT(s.id) as total,
       COUNT(CASE WHEN a.status = 'bor' THEN 1 END) as present,
       COUNT(CASE WHEN a.status IN ('yoq','sababli','sababsiz') THEN 1 END) as absent,
       COUNT(CASE WHEN a.status = 'sababli' THEN 1 END) as excused,
       COUNT(CASE WHEN a.status = 'sababsiz' THEN 1 END) as unexcused,
       COUNT(CASE WHEN a.status IS NULL THEN 1 END) as not_marked
       FROM students s
       JOIN floors f ON f.id = s.floor_id
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1
       WHERE s.is_active = true ${floorFilter}`,
      params
    );

    const floorStats = await pool.query(
      `SELECT f.floor_number, f.name,
       COUNT(s.id) as total,
       COUNT(CASE WHEN a.status = 'bor' THEN 1 END) as present,
       COUNT(CASE WHEN a.status IN ('yoq','sababli','sababsiz') THEN 1 END) as absent
       FROM floors f
       LEFT JOIN students s ON s.floor_id = f.id AND s.is_active = true
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1
       WHERE f.is_active = true
       GROUP BY f.id, f.floor_number, f.name
       ORDER BY f.floor_number`,
      [today]
    );

    const weekTrend = await pool.query(
      `SELECT a.date,
       COUNT(CASE WHEN a.status = 'bor' THEN 1 END) as present,
       COUNT(CASE WHEN a.status IN ('yoq','sababli','sababsiz') THEN 1 END) as absent
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       JOIN floors f ON f.id = s.floor_id
       WHERE a.date >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY a.date ORDER BY a.date`
    );

    res.json({ today: todayStats.rows[0], floors: floorStats.rows, week_trend: weekTrend.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const getDailyReport = async (req, res) => {
  try {
    const user = req.user;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    let floorFilter = '';
    const params = [targetDate];
    // Sardor uchun statistika o'z qavati, lekin floor stats hammasi
    if (user.role === 'sardor') { floorFilter = ' AND f.floor_number = $2'; params.push(user.floor_number); }

    const result = await pool.query(
      `SELECT s.first_name, s.last_name, s.phone, s.faculty, s.region,
       r.room_number, f.floor_number, f.name as floor_name,
       COALESCE(a.status, 'belgilanmagan') as status,
       a.reason, a.note, a.marked_at, u.full_name as marked_by
       FROM students s
       JOIN rooms r ON r.id = s.room_id
       JOIN floors f ON f.id = s.floor_id
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1
       LEFT JOIN users u ON u.id = a.marked_by
       WHERE s.is_active = true ${floorFilter}
       ORDER BY f.floor_number, r.room_number, s.last_name`,
      params
    );
    res.json({ date: targetDate, data: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    const user = req.user;
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();
    let floorFilter = '';
    const params = [y, m];
    // Sardor uchun statistika o'z qavati, lekin floor stats hammasi
    if (user.role === 'sardor') { floorFilter = ' AND f.floor_number = $3'; params.push(user.floor_number); }

    const result = await pool.query(
      `SELECT s.id, s.first_name, s.last_name, r.room_number, f.floor_number,
       COUNT(CASE WHEN a.status = 'bor' THEN 1 END) as present_days,
       COUNT(CASE WHEN a.status IN ('yoq','sababli','sababsiz') THEN 1 END) as absent_days,
       COUNT(CASE WHEN a.status = 'sababli' THEN 1 END) as excused_days,
       COUNT(CASE WHEN a.status = 'sababsiz' THEN 1 END) as unexcused_days,
       COUNT(a.id) as total_marked,
       ROUND(COUNT(CASE WHEN a.status = 'bor' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0), 1) as attendance_percent
       FROM students s
       JOIN rooms r ON r.id = s.room_id
       JOIN floors f ON f.id = s.floor_id
       LEFT JOIN attendance a ON a.student_id = s.id
         AND EXTRACT(YEAR FROM a.date) = $1
         AND EXTRACT(MONTH FROM a.date) = $2
       WHERE s.is_active = true ${floorFilter}
       GROUP BY s.id, s.first_name, s.last_name, r.room_number, f.floor_number
       ORDER BY f.floor_number, attendance_percent ASC`,
      params
    );
    res.json({ month: m, year: y, data: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const exportExcel = async (req, res) => {
  try {
    const user = req.user;
    const { type, date, month, year, floor_number } = req.query;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TATU Yotoqxona';
    workbook.created = new Date();

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } },
      alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
      border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    };

    const cellBorder = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

    if (type === 'monthly') {
      const m = month || new Date().getMonth() + 1;
      const y = year || new Date().getFullYear();

      let floorFilter = '';
      const params = [y, m];
      // Sardor uchun statistika o'z qavati, lekin floor stats hammasi
    if (user.role === 'sardor') { floorFilter = ' AND f.floor_number = $3'; params.push(user.floor_number); }
      if (floor_number && user.role !== 'sardor') { floorFilter = ' AND f.floor_number = $3'; params.push(floor_number); }

      // Sheet 1: Umumiy jadval
      const sheet1 = workbook.addWorksheet('Oylik Hisobot', { pageSetup: { paperSize: 9, orientation: 'landscape' } });

      const summaryResult = await pool.query(
        `SELECT s.id, s.first_name, s.last_name, r.room_number, f.floor_number, s.faculty, s.region,
         COUNT(CASE WHEN a.status = 'bor' THEN 1 END) as present,
         COUNT(CASE WHEN a.status IN ('yoq','sababli','sababsiz') THEN 1 END) as absent,
         COUNT(CASE WHEN a.status = 'sababli' THEN 1 END) as excused,
         COUNT(CASE WHEN a.status = 'sababsiz' THEN 1 END) as unexcused,
         ROUND(COUNT(CASE WHEN a.status = 'bor' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id),0),1) as percent
         FROM students s JOIN rooms r ON r.id = s.room_id JOIN floors f ON f.id = s.floor_id
         LEFT JOIN attendance a ON a.student_id = s.id AND EXTRACT(YEAR FROM a.date)=$1 AND EXTRACT(MONTH FROM a.date)=$2
         WHERE s.is_active = true ${floorFilter}
         GROUP BY s.id, s.first_name, s.last_name, r.room_number, f.floor_number, s.faculty, s.region
         ORDER BY f.floor_number, s.last_name`, params
      );

      sheet1.mergeCells('A1:L1');
      sheet1.getCell('A1').value = `TATU B-Blok Yotoqxona — Oylik Davomat Hisoboti (${m}/${y})`;
      sheet1.getCell('A1').style = { font: { bold: true, size: 14, color: { argb: 'FF1E3A5F' } }, alignment: { horizontal: 'center' } };
      sheet1.getRow(1).height = 30;

      const h1 = ['#', 'Familiya', 'Ism', 'Xona', 'Qavat', 'Kurs', 'Viloyat', 'Bor (kun)', "Yo'q (kun)", 'Sababli', 'Sababsiz', 'Davomat %'];
      sheet1.addRow(h1);
      sheet1.getRow(2).eachCell(cell => { cell.style = headerStyle; });
      sheet1.getRow(2).height = 25;

      summaryResult.rows.forEach((row, idx) => {
        const r = sheet1.addRow([
          idx + 1, row.last_name, row.first_name, row.room_number, row.floor_number,
          row.faculty || '—', row.region, parseInt(row.present) || 0,
          parseInt(row.absent) || 0, parseInt(row.excused) || 0,
          parseInt(row.unexcused) || 0, (row.percent || 0) + '%'
        ]);
        const percent = parseFloat(row.percent) || 0;
        const bgColor = percent >= 90 ? 'FFD4EDDA' : percent >= 70 ? 'FFFFF3CD' : 'FFF8D7DA';
        r.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
          cell.border = cellBorder;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      });

      sheet1.columns = [
        { width: 5 }, { width: 18 }, { width: 15 }, { width: 8 },
        { width: 8 }, { width: 12 }, { width: 15 }, { width: 10 },
        { width: 10 }, { width: 10 }, { width: 10 }, { width: 12 }
      ];

      // Sheet 2: Yo'q kunlar detali (aniq sanalar + sabablar)
      const sheet2 = workbook.addWorksheet("Yo'q Kunlar Detali", { pageSetup: { paperSize: 9, orientation: 'landscape' } });

      const absentDetail = await pool.query(
        `SELECT s.first_name, s.last_name, r.room_number, f.floor_number,
         a.date, a.status, a.reason
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         JOIN rooms r ON r.id = s.room_id
         JOIN floors f ON f.id = s.floor_id
         WHERE a.status IN ('yoq','sababli','sababsiz')
           AND EXTRACT(YEAR FROM a.date) = $1
           AND EXTRACT(MONTH FROM a.date) = $2
           ${floorFilter}
         ORDER BY f.floor_number, s.last_name, a.date`,
        params
      );

      sheet2.mergeCells('A1:G1');
      sheet2.getCell('A1').value = `TATU B-Blok — Yo'q Kunlar Detali (${m}/${y})`;
      sheet2.getCell('A1').style = { font: { bold: true, size: 14, color: { argb: 'FFCC0000' } }, alignment: { horizontal: 'center' } };
      sheet2.getRow(1).height = 30;

      const h2 = ['#', 'Familiya', 'Ism', 'Xona', 'Qavat', 'Sana', 'Holat', 'Sabab'];
      sheet2.addRow(h2);
      sheet2.getRow(2).eachCell(cell => { cell.style = headerStyle; });
      sheet2.getRow(2).height = 25;

      const statusLabels2 = { yoq: "Yo'q", sababli: 'Sababli', sababsiz: 'Sababsiz' };
      const statusColors2 = { yoq: 'FFF8D7DA', sababli: 'FFFFF3CD', sababsiz: 'FFFFE0E0' };

      absentDetail.rows.forEach((row, idx) => {
        const dateStr = new Date(row.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const r = sheet2.addRow([
          idx + 1, row.last_name, row.first_name, row.room_number,
          row.floor_number, dateStr, statusLabels2[row.status] || row.status, row.reason || '—'
        ]);
        const bg = statusColors2[row.status] || 'FFF0F0F0';
        r.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
          cell.border = cellBorder;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        // Sabab ustunini chapga align
        r.getCell(8).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      });

      sheet2.columns = [
        { width: 5 }, { width: 18 }, { width: 15 }, { width: 8 },
        { width: 8 }, { width: 14 }, { width: 12 }, { width: 35 }
      ];

    } else {
      // Kunlik hisobot
      const targetDate = date || new Date().toISOString().split('T')[0];
      let floorFilter = '';
      const params = [targetDate];
      // Sardor uchun statistika o'z qavati, lekin floor stats hammasi
    if (user.role === 'sardor') { floorFilter = ' AND f.floor_number = $2'; params.push(user.floor_number); }

      const result = await pool.query(
        `SELECT s.first_name, s.last_name, r.room_number, f.floor_number, s.faculty, s.region,
         COALESCE(a.status, 'belgilanmagan') as status, a.reason, a.note
         FROM students s JOIN rooms r ON r.id = s.room_id JOIN floors f ON f.id = s.floor_id
         LEFT JOIN attendance a ON a.student_id = s.id AND a.date = $1
         WHERE s.is_active = true ${floorFilter}
         ORDER BY f.floor_number, r.room_number, s.last_name`, params
      );

      const sheet = workbook.addWorksheet('Kunlik Davomat', { pageSetup: { paperSize: 9, orientation: 'landscape' } });

      const dateStr = new Date(targetDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
      sheet.mergeCells('A1:I1');
      sheet.getCell('A1').value = `TATU B-Blok Yotoqxona — Kunlik Davomat (${dateStr})`;
      sheet.getCell('A1').style = { font: { bold: true, size: 14, color: { argb: 'FF1E3A5F' } }, alignment: { horizontal: 'center' } };
      sheet.getRow(1).height = 30;

      const headers = ['#', 'Familiya', 'Ism', 'Xona', 'Qavat', 'Kurs', 'Viloyat', 'Holat', 'Sabab / Izoh'];
      sheet.addRow(headers);
      sheet.getRow(2).eachCell(cell => { cell.style = headerStyle; });
      sheet.getRow(2).height = 25;

      const statusColors = { bor: 'FFD4EDDA', yoq: 'FFF8D7DA', sababli: 'FFFFF3CD', sababsiz: 'FFFFE0E0', belgilanmagan: 'FFF0F0F0' };
      const statusLabels = { bor: '✓ Bor', yoq: "✗ Yo'q", sababli: '⚠ Sababli', sababsiz: '✗ Sababsiz', belgilanmagan: '— Belgilanmagan' };

      result.rows.forEach((row, idx) => {
        const r = sheet.addRow([
          idx + 1, row.last_name, row.first_name, row.room_number,
          row.floor_number, row.faculty || '—', row.region,
          statusLabels[row.status] || row.status,
          row.reason || row.note || ''
        ]);
        const bg = statusColors[row.status] || 'FFF0F0F0';
        r.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
          cell.border = cellBorder;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        r.getCell(9).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      });

      sheet.columns = [
        { width: 5 }, { width: 18 }, { width: 15 }, { width: 8 },
        { width: 8 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 35 }
      ];
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=davomat-${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Excel yaratishda xato: ' + err.message });
  }
};

const addHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;
    const result = await pool.query(
      'INSERT INTO holidays (date, name, created_by) VALUES ($1, $2, $3) ON CONFLICT (date) DO UPDATE SET name=$2 RETURNING *',
      [date, name, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const getHolidays = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM holidays ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    await pool.query('DELETE FROM holidays WHERE id = $1', [req.params.id]);
    res.json({ message: "O'chirildi" });
  } catch (err) {
    res.status(500).json({ message: 'Server xatosi' });
  }
};

module.exports = { getStats, getDailyReport, getMonthlyReport, exportExcel, addHoliday, getHolidays, deleteHoliday };
