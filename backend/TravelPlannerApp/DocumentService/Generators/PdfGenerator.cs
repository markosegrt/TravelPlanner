using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Common.DTOs;

namespace DocumentService.Generators
{
    // [OUT-OF-EXERCISE] PDF generisanje — nije pokriveno na vežbama
    public static class PdfGenerator
    {
        public static byte[] Generate(TripDetailDto trip)
        {
            // QuestPDF Community licenca — obavezno za besplatnu upotrebu
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(40);
                    page.DefaultTextStyle(x => x.FontSize(11));

                    // ====== HEADER ======
                    page.Header().Column(col =>
                    {
                        col.Item().Text(trip.Name)
                            .FontSize(24).Bold().FontColor(Colors.Blue.Darken2);

                        if (!string.IsNullOrEmpty(trip.Description))
                            col.Item().Text(trip.Description).FontSize(12).Italic();

                        col.Item().Text($"{trip.StartDate:MMM dd, yyyy} — {trip.EndDate:MMM dd, yyyy}")
                            .FontSize(12).FontColor(Colors.Grey.Darken1);

                        col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    });

                    // ====== CONTENT ======
                    page.Content().Column(col =>
                    {
                        // Budget Summary
                        col.Item().PaddingVertical(10).Column(budget =>
                        {
                            budget.Item().Text("Budget Summary").FontSize(16).Bold();
                            budget.Item().Text($"Planned: {trip.BudgetSummary.PlannedBudget:C}");
                            budget.Item().Text($"Spent: {trip.BudgetSummary.TotalSpent:C}");
                            budget.Item().Text($"Remaining: {trip.BudgetSummary.Remaining:C}")
                                .FontColor(trip.BudgetSummary.Remaining >= 0
                                    ? Colors.Green.Darken2
                                    : Colors.Red.Darken2);
                        });

                        // Destinations
                        if (trip.Destinations.Count > 0)
                        {
                            col.Item().PaddingVertical(10).Column(dest =>
                            {
                                dest.Item().Text("Destinations").FontSize(16).Bold();
                                foreach (var d in trip.Destinations)
                                {
                                    dest.Item().PaddingVertical(3).Column(item =>
                                    {
                                        item.Item().Text($"• {d.Name} — {d.Location}").Bold();
                                        item.Item().Text($"  {d.ArrivalDate:MMM dd} — {d.DepartureDate:MMM dd}");
                                        if (!string.IsNullOrEmpty(d.Notes))
                                            item.Item().Text($"  {d.Notes}").Italic();
                                    });
                                }
                            });
                        }

                        // Activities
                        if (trip.Activities.Count > 0)
                        {
                            col.Item().PaddingVertical(10).Column(act =>
                            {
                                act.Item().Text("Activities").FontSize(16).Bold();

                                var grouped = trip.Activities
                                    .OrderBy(a => a.Date).ThenBy(a => a.Time)
                                    .GroupBy(a => a.Date.Date);

                                foreach (var day in grouped)
                                {
                                    act.Item().PaddingVertical(5)
                                        .Text(day.Key.ToString("dddd, MMM dd, yyyy"))
                                        .FontSize(13).Bold().FontColor(Colors.Blue.Darken1);

                                    foreach (var a in day)
                                    {
                                        act.Item().PaddingVertical(2).Column(item =>
                                        {
                                            var time = a.Time.HasValue
                                                ? $"{a.Time.Value:hh\\:mm} — " : "";
                                            item.Item().Text($"  {time}{a.Name} [{a.Status}]");
                                            if (!string.IsNullOrEmpty(a.Location))
                                                item.Item().Text($"    Location: {a.Location}");
                                            if (a.EstimatedCost > 0)
                                                item.Item().Text($"    Est. cost: {a.EstimatedCost:C}");
                                        });
                                    }
                                }
                            });
                        }

                        // Expenses
                        if (trip.Expenses.Count > 0)
                        {
                            col.Item().PaddingVertical(10).Column(exp =>
                            {
                                exp.Item().Text("Expenses").FontSize(16).Bold();
                                foreach (var e in trip.Expenses.OrderByDescending(e => e.Date))
                                {
                                    exp.Item().PaddingVertical(2)
                                        .Text($"• {e.Date:MMM dd} — {e.Name} ({e.Category}): {e.Amount:C}");
                                }
                            });
                        }

                        // Checklist
                        if (trip.ChecklistItems.Count > 0)
                        {
                            col.Item().PaddingVertical(10).Column(chk =>
                            {
                                chk.Item().Text("Checklist").FontSize(16).Bold();
                                foreach (var c in trip.ChecklistItems)
                                {
                                    var check = c.IsCompleted ? "☑" : "☐";
                                    chk.Item().PaddingVertical(1)
                                        .Text($"  {check} {c.Name}");
                                }
                            });
                        }

                        // Notes
                        if (!string.IsNullOrEmpty(trip.GeneralNotes))
                        {
                            col.Item().PaddingVertical(10).Column(notes =>
                            {
                                notes.Item().Text("Notes").FontSize(16).Bold();
                                notes.Item().Text(trip.GeneralNotes);
                            });
                        }
                    });

                    // ====== FOOTER ======
                    page.Footer().AlignCenter()
                        .Text(t =>
                        {
                            t.Span("Generated by TravelPlanner — ");
                            t.Span(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm")).Italic();
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}
