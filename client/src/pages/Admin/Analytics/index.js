import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Row, Col, Button } from "react-bootstrap";
import analyticApi from "../../../api/analyticApi";
import styles from "./AnalyticsPage.module.css";
import { useEffect, useState } from "react";
import DashboardCard from "../DashboardCard";
import Loading from "../../../components/Loading";
import { FaBook, FaChartBar, FaShoppingBag } from "react-icons/fa";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AnalyticsPage() {
  const [revenueChartData, setRevenueChartData] = useState({});
  const [orderCountLifeTimeChartData, setOrderCountLifeTimeChartData] = useState({});
  const [bookBestSellerChartData, setBookBestSellerChartData] = useState({});
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [summary, setSummary] = useState({ orders: 0, revenue: 0, profit: 0 });
  const [revenueTime, setRevenueTime] = useState({ value: "day", text: "Ngày" });
  const [quickRange, setQuickRange] = useState("today");
  const [cardData, setCardData] = useState({});

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const { data } = await analyticApi.getDashboardCard();
        setCardData(data);
      } catch (error) {
        setCardData(null);
        console.log(error);
      }
    };
    fetchCardData();
  }, []);

  useEffect(() => {
    if (quickRange !== "custom" && customRange.from && customRange.to) {
      handleCustomStatistic();
    }
    // eslint-disable-next-line
  }, [customRange]);

  const handleExportReport = async () => {
    try {
      // Lấy lại dữ liệu chi tiết sản phẩm trong khoảng thời gian đã chọn
      const { data } = await analyticApi.getSummaryByRange({
        from: customRange.from,
        to: customRange.to,
      });

      // Chuẩn bị dữ liệu cho Excel
      const excelData = data.products.map(item => ({
        "Tên sản phẩm": item.name,
        "Số lượng": item.quantity,
        "Giá bán": item.price,
        "Tổng tiền": item.total,
        "Lợi nhuận": item.profit,
      }));

      // Thêm dòng tổng cuối file
      excelData.push({
        "Tên sản phẩm": "TỔNG",
        "Số lượng": data.products.reduce((sum, i) => sum + i.quantity, 0),
        "Giá bán": "",
        "Tổng tiền": data.products.reduce((sum, i) => sum + i.total, 0),
        "Lợi nhuận": data.products.reduce((sum, i) => sum + i.profit, 0),
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "BaoCaoSanPham");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "bao_cao_san_pham.xlsx");
    } catch (error) {
      alert("Không thể xuất báo cáo!");
      console.log(error);
    }
  };

  const getRangeByQuick = (type) => {
    const today = dayjs();
    switch (type) {
      case "today":
        return { from: today.format("YYYY-MM-DD"), to: today.format("YYYY-MM-DD") };
      case "yesterday":
        return { from: today.subtract(1, "day").format("YYYY-MM-DD"), to: today.subtract(1, "day").format("YYYY-MM-DD") };
      case "thisweek":
        return { from: today.startOf("week").format("YYYY-MM-DD"), to: today.endOf("week").format("YYYY-MM-DD") };
      case "lastweek":
        return {
          from: today.subtract(1, "week").startOf("week").format("YYYY-MM-DD"),
          to: today.subtract(1, "week").endOf("week").format("YYYY-MM-DD"),
        };
      case "thismonth":
        return { from: today.startOf("month").format("YYYY-MM-DD"), to: today.endOf("month").format("YYYY-MM-DD") };
      case "thisyear":
        return { from: today.startOf("year").format("YYYY-MM-DD"), to: today.endOf("year").format("YYYY-MM-DD") };
      default:
        return { from: "", to: "" };
    }
  };

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        let chartData = [];
        let now = new Date();
        let start, end;

        switch (revenueTime.value) {
          case "day": {
            end = new Date();
            start = new Date();
            start.setDate(end.getDate() - 29);
            const { data } = await analyticApi.getRevenueByDay({
              start: start.toISOString().slice(0, 10),
              end: end.toISOString().slice(0, 10),
            });
            chartData = data;
            break;
          }
          case "week": {
            end = new Date();
            start = new Date();
            start.setDate(end.getDate() - 7 * 11);
            const { data } = await analyticApi.getRevenueByWeek({
              start: start.toISOString().slice(0, 10),
              end: end.toISOString().slice(0, 10),
            });
            chartData = data;
            break;
          }
          case "month": {
            end = new Date();
            start = new Date();
            start.setMonth(end.getMonth() - 11);
            const { data } = await analyticApi.getRevenueByMonth({
              start: start.toISOString().slice(0, 7),
              end: end.toISOString().slice(0, 7),
            });
            chartData = data;
            break;
          }
          default: {
            const { data } = await analyticApi.getRevenueLifeTime();
            chartData = data;
            break;
          }
        }

        setRevenueChartData({
          labels: chartData.map((item) => item._id),
          datasets: [
            {
              label: "Doanh thu",
              data: chartData.map((item) => item.revenue),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132)",
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchRevenue();
  }, [revenueTime]);

 // Khi chọn nhanh, cập nhật customRange luôn
  useEffect(() => {
    if (quickRange !== "custom") {
      setCustomRange(getRangeByQuick(quickRange));
    }
  }, [quickRange]);

  const handleCustomStatistic = async () => {
    try {
      const { data } = await analyticApi.getSummaryByRange({
        from: customRange.from,
        to: customRange.to,
      });
      console.log("DATA SUMMARY:", data);
      setSummary({
        orders: data.orders ?? 0,
        revenue: data.revenue ?? 0,
        profit: data.profit ?? 0,
      });
      setRevenueChartData({
        labels: data.chart ? data.chart.map((item) => item._id) : [],
        datasets: [
          {
            label: "Doanh thu",
            data: data.chart ? data.chart.map((item) => item.revenue) : [],
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132)",
          },
        ],
      });
      // Nếu muốn xuất báo cáo sản phẩm, lưu thêm data.products vào state nếu cần
    } catch (error) {
        setSummary({ orders: 0, revenue: 0, profit: 0 });
        setRevenueChartData({
          labels: [],
          datasets: [],
        });
        console.log(error);
      }
  };

  useEffect(() => {
    if (quickRange === "custom" && customRange.from && customRange.to) {
      handleCustomStatistic();
    }
    // eslint-disable-next-line
  }, [customRange]);

  const handleChangeRevenueTime = (e) => {
    const index = e.target.selectedIndex;
    setRevenueTime({
      value: e.target.value,
      text: e.target[index].text,
    });
  };

  useEffect(() => {
    const fetchCountOrderLifeTime = async () => {
      try {
        const { data: chartData } = await analyticApi.getCountOrderLifeTime();
        setOrderCountLifeTimeChartData({
          labels: chartData.map((item) => item?._id),
          datasets: [
            {
              label: "Số lượng đơn hàng",
              data: chartData.map((item) => item?.total),
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192)",
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    };

    const fetchBookBestSeller = async () => {
      try {
        const { data: chartData } = await analyticApi.getBestSeller();
        setBookBestSellerChartData({
          labels: chartData.map((item) => item.product[0]?.name),
          datasets: [
            {
              label: "Sản phẩm bán chạy",
              data: chartData.map((item) => item.count),
              backgroundColor: ["#ff6384", "#e8c3b9", "#ffce56", "#8e5ea2"],
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchCountOrderLifeTime();
    fetchBookBestSeller();
  }, []);

  return (
    <div className={styles.wrapperDashboard}>
      {/* Thống kê bán hàng ngang to */}
      <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
        <h4
          className="fw-bold mb-4"
          style={{
            background: "linear-gradient(90deg,#226d3d,#6bb07a)",
            color: "#fff",
            borderRadius: 12,
            padding: "16px 24px",
          }}
        >
          Thống kê bán hàng
        </h4>
        <form className="row g-3 align-items-end mb-4">
          <div className="col-md-4">
            <label className="form-label fw-semibold">Chọn nhanh</label>
            <select
              className="form-select"
              value={quickRange}
              onChange={e => setQuickRange(e.target.value)}
            >
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="thisweek">Tuần này</option>
              <option value="lastweek">Tuần trước</option>
              <option value="thismonth">Tháng này</option>
              <option value="thisyear">Năm nay</option>
              <option value="custom">Tùy chọn</option>
            </select>
          </div>
          {quickRange === "custom" && (
            <>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Từ ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={customRange.from}
                  onChange={e => setCustomRange(r => ({ ...r, from: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Đến ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={customRange.to}
                  onChange={e => setCustomRange(r => ({ ...r, to: e.target.value }))}
                />
              </div>
            </>
          )}
          <div className="col-md-2 d-flex align-items-end">
            <Button
              variant="success"
              className="w-100"
              style={{ height: 40 }}
              onClick={handleExportReport}
              disabled={!customRange.from || !customRange.to}
            >
              <i className="bi bi-file-earmark-excel me-2"></i> Xuất báo cáo
            </Button>
          </div>
        </form>
        <Row className="g-4">
          <Col md={4}>
            <div className="bg-light rounded-4 shadow-sm p-4 text-center h-100">
              <div className="fs-1 text-success mb-2">
                <i className="bi bi-cart4"></i>
              </div>
              <div className="fw-bold fs-5 text-secondary">Tổng sản phẩm bán ra</div>
              <div className="fs-2">{summary.orders.toLocaleString()}</div>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-light rounded-4 shadow-sm p-4 text-center h-100">
              <div className="fs-1 text-success mb-2">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="fw-bold fs-5 text-secondary">Tổng doanh thu</div>
              <div className="fs-2">{summary.revenue.toLocaleString()} VND</div>
            </div>
          </Col>
          <Col md={4}>
            <div className="bg-light rounded-4 shadow-sm p-4 text-center h-100">
              <div className="fs-1 text-danger mb-2">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <div className="fw-bold fs-5 text-secondary">Tổng lợi nhuận</div>
              <div className={`fs-2 ${summary.profit < 0 ? "text-danger" : "text-success"}`}>
                {summary.profit.toLocaleString()} VND
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Row className="mb-4">
        <Col xl={8} className="mb-4">
          <div className={styles.chart}>
            <h2>DOANH THU</h2>
            {/* Ẩn select nếu đang chọn theo khoảng ngày */}
            {quickRange === "custom" ? null : (
              <select
                className={`form-select ${styles.revenueSelectTime} mb-3`}
                value={revenueTime.value}
                onChange={handleChangeRevenueTime}
                style={{ maxWidth: 220 }}
              >
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
                <option value="all">Toàn thời gian</option>
              </select>
            )}
            {/* Luôn hiển thị biểu đồ doanh thu theo dữ liệu revenueChartData */}
            {revenueChartData && revenueChartData.datasets && (
              <Bar
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    title: {
                      display: true,
                      text: `Doanh thu ${quickRange === "custom" ? "theo khoảng thời gian" : (revenueTime && revenueTime.text)}`,
                    },
                  },
                }}
                data={revenueChartData}
              />
            )}
          </div>
        </Col>
        <Col xl={4} className="mb-4">
          <div className={styles.chart}>
            <h2>SẢN PHẨM BÁN CHẠY</h2>
            {bookBestSellerChartData && bookBestSellerChartData.datasets && (
              <Pie
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                      align: "start",
                    },
                    title: {
                      display: true,
                      text: "Sản phẩm bán chạy",
                    },
                  },
                }}
                data={bookBestSellerChartData}
              />
            )}
          </div>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <div className={styles.chart}>
            <h2>SỐ LƯỢNG ĐƠN HÀNG</h2>
            {orderCountLifeTimeChartData && orderCountLifeTimeChartData.datasets && (
              <Bar
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" },
                    title: {
                      display: true,
                      text: "Đơn hàng toàn thời gian",
                    },
                  },
                }}
                data={orderCountLifeTimeChartData}
              />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AnalyticsPage;