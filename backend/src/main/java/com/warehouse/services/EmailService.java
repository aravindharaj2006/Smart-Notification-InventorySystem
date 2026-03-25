package com.warehouse.services;

import com.warehouse.entities.ProductVariant;
import com.warehouse.entities.Supplier;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendLowStockAlertEmail(Supplier supplier, ProductVariant variant, String status) {
        if (supplier == null || supplier.getEmail() == null || supplier.getEmail().trim().isEmpty()) {
            log.warn("Cannot send email: Supplier or email is missing for variant ID {}", variant.getVariantId());
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(supplier.getEmail());
            String formattedStatus = status.replace("_", " ");
            String subject = "URGENT Warehouse Alert: " + formattedStatus + " for " + variant.getProduct().getProductName();
            helper.setSubject(subject);

            String htmlContent = String.format(
                    "<h3>Warehouse Inventory Alert</h3>" +
                    "<p>Dear %s,</p>" +
                    "<p>This is an automated notification from the Warehouse Intelligence System.</p>" +
                    "<p>The following product has reached critically low levels and requires immediate restocking:</p>" +
                    "<ul>" +
                    "<li><b>Product:</b> %s</li>" +
                    "<li><b>Variant:</b> %s</li>" +
                    "<li><b>Current Stock:</b> <strong style='color: red;'>%d</strong></li>" +
                    "<li><b>Threshold Level:</b> %d</li>" +
                    "<li><b>Status:</b> <span style='color: red; font-weight: bold;'>%s</span></li>" +
                    "</ul>" +
                    "<p>Please arrange for a delivery/restock as soon as possible.</p>" +
                    "<p>Best regards,<br>Warehouse Intelligence System</p>",
                    supplier.getName(),
                    variant.getProduct().getProductName(),
                    variant.getVariantName(),
                    variant.getStock(),
                    variant.getThreshold(),
                    formattedStatus
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Successfully sent low stock alert email to {}", supplier.getEmail());

        } catch (MessagingException e) {
            log.error("Failed to send low stock alert email to supplier {}", supplier.getEmail(), e);
        }
    }
}
