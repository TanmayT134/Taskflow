
package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.entity.Task;
import com.taskflow.taskflow_backend.enums.ReminderType;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class TaskReminderEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    public void sendReminder(Task task, ReminderType reminderType)
            throws MessagingException {

        String recipient = task.getUser().getEmail();

        String fullName = task.getUser().getFullName();
        if (fullName == null || fullName.isBlank()) {
            fullName = "there";
        }

        String taskTitle = task.getTitle();
        String dueDate = task.getDueDate().format(DATE_FORMAT);
        String priority = task.getPriority().name();

        String subject = getSubject(reminderType);

        String safeName = HtmlUtils.htmlEscape(fullName);
        String safeTitle = HtmlUtils.htmlEscape(taskTitle);
        String safePriority = HtmlUtils.htmlEscape(priority);
        String safeDueDate = HtmlUtils.htmlEscape(dueDate);

        String applicationUrl = frontendUrl.replaceAll("/+$", "");
        String safeApplicationUrl = HtmlUtils.htmlEscape(applicationUrl);

        String plainText = """
                Taskflow

                %s

                Hello %s,

                %s

                Task: %s
                Due date: %s
                Priority: %s

                Open Taskflow to manage your task:
                %s

                Regards,
                Taskflow Team
                """.formatted(
                getHeading(reminderType),
                fullName,
                getMessage(reminderType),
                taskTitle,
                dueDate,
                priority,
                applicationUrl
        );

        String htmlText = """
                <!DOCTYPE html>
                <html>
                <body style="margin:0;padding:30px;background-color:#f4f6fa;
                             font-family:Arial,Helvetica,sans-serif;color:#202938;">

                    <div style="max-width:560px;margin:0 auto;background:#ffffff;
                                border-radius:12px;padding:32px;
                                border:1px solid #e5e9f0;">

                        <h2 style="margin:0 0 24px;color:#2563eb;">
                            Taskflow
                        </h2>

                        <h3 style="margin:0 0 18px;color:#202938;">
                            %s
                        </h3>

                        <p style="font-size:15px;line-height:1.6;">
                            Hello <strong>%s</strong>,
                        </p>

                        <p style="font-size:14px;line-height:1.7;color:#526071;">
                            %s
                        </p>

                        <div style="margin:24px 0;padding:20px;
                                    background:#f8fafc;border:1px solid #e5e9f0;
                                    border-radius:8px;">

                            <h3 style="margin:0 0 16px;color:#202938;">
                                %s
                            </h3>

                            <p style="margin:8px 0;font-size:14px;">
                                <strong>Due date:</strong> %s
                            </p>

                            <p style="margin:8px 0;font-size:14px;">
                                <strong>Priority:</strong> %s
                            </p>

                        </div>

                        <a href="%s"
                           style="display:inline-block;padding:12px 22px;
                                  background:#2563eb;color:#ffffff;
                                  text-decoration:none;border-radius:7px;
                                  font-size:14px;font-weight:bold;">
                            Open Taskflow
                        </a>

                        <p style="margin-top:30px;font-size:13px;
                                  line-height:1.6;color:#7b8794;">
                            Regards,<br>
                            <strong>Taskflow Team</strong>
                        </p>

                    </div>
                </body>
                </html>
                """.formatted(
                getHeading(reminderType),
                safeName,
                HtmlUtils.htmlEscape(getMessage(reminderType)),
                safeTitle,
                safeDueDate,
                safePriority,
                safeApplicationUrl
        );

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper = new MimeMessageHelper(
                message,
                true,
                StandardCharsets.UTF_8.name()
        );

        helper.setTo(recipient);
        helper.setSubject(subject);
        helper.setText(plainText, htmlText);

        mailSender.send(message);
    }

    private String getSubject(ReminderType reminderType) {
        return switch (reminderType) {
            case DAY_BEFORE -> "Reminder: Your task is due tomorrow";
            case DUE_TODAY -> "Reminder: Your task is due today";
            case OVERDUE -> "Taskflow: Your task is overdue!";
        };
    }

    private String getHeading(ReminderType reminderType) {
        return switch (reminderType) {
            case DAY_BEFORE -> "Your task is due tomorrow";
            case DUE_TODAY -> "Your task is due today!";
            case OVERDUE -> "Your task is overdue!";
        };
    }

    private String getMessage(ReminderType reminderType) {
        return switch (reminderType) {
            case DAY_BEFORE ->
                    "This is a friendly reminder that your task is due tomorrow. "
                    + "Plan ahead and complete it on time.";

            case DUE_TODAY ->
                    "Your task is due today. Make sure you complete it before "
                    + "the end of the day.";

            case OVERDUE ->
                    "This task is still pending. Please complete it as soon as possible.";
        };
    }
}
