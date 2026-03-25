import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/warehouse_intelligence", "root", "#windows8");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT email, role FROM app_user WHERE role='ADMIN' LIMIT 1");
            if (rs.next()) {
                System.out.println("Admin Email: " + rs.getString("email"));
            } else {
                System.out.println("No admin found.");
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
