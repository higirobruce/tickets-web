// @ts-check
const { test, expect } = require("@playwright/test");

const API = "http://localhost:8089";
const suffix = Date.now();
let seeds = 0;

/** Register a fresh organiser and one event straight through the API so each UI test starts from a known state. */
async function seed(request) {
  const organiser = {
    firstName: "Smoke",
    lastName: "Owner",
    email: `smoke-${suffix}-${++seeds}@example.com`,
    password: "smoke-pass-1",
    organisation: "Smoke Events",
  };
  const reg = await request.post(`${API}/users/register`, { data: organiser });
  expect(reg.ok()).toBeTruthy();
  const { token } = await reg.json();
  const ev = await request.post(`${API}/events`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: `Smoke Concert ${suffix}`,
      artist: "The Smoke Band",
      date: "2030-03-15T19:00:00.000Z",
      location: "Kigali Arena",
      imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
      packages: [
        { title: "Regular", price: 5000, currency: "RWF" },
        { title: "VIP", price: 20000, currency: "RWF" },
      ],
    },
  });
  expect(ev.ok()).toBeTruthy();
  return { token, event: await ev.json(), organiser };
}

test("buy a ticket, open it from its link, scan it, see it on the dashboard", async ({ page, request }) => {
  const { event, organiser } = await seed(request);

  // Home lists the event
  await page.goto("/");
  await expect(page.getByText(event.title)).toBeVisible();

  // Event page: pick VIP and pay
  await page.goto(`/events/${event._id}`);
  await page.getByRole("radio", { name: /VIP/ }).click();
  await page.getByLabel("Enter a telephone number for payment").fill("788123456");
  await page.getByRole("button", { name: "Pay online" }).click();

  // Mock payments confirm within seconds
  const ticketLink = page.getByRole("link", { name: /^Ticket \d+$/ });
  await expect(ticketLink).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("Test mode: no money was taken")).toBeVisible();
  const ticketHref = await ticketLink.getAttribute("href");
  const number = (await ticketLink.textContent()).replace("Ticket ", "").trim();

  // Buyer view of the ticket
  await page.goto(ticketHref);
  await expect(page.getByText(number)).toBeVisible();
  await expect(page.getByText("pending")).toBeVisible();

  // Gate: open the ticket without showOnly, log in inline, consume
  await page.goto(ticketHref.replace("?showOnly=1", ""));
  await page.getByLabel("Your username").fill(organiser.email);
  await page.getByLabel("Password").fill(organiser.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "Consume" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("Ticket already consumed")).toBeVisible();

  // Organiser dashboard counts it
  await page.goto(`/organiser/events/${event._id}`);
  await expect(page.getByText(event.title)).toBeVisible();
  await expect(page.getByText("Tickets issued").locator("..").getByText("1", { exact: true })).toBeVisible();
  await expect(page.getByText("Checked in", { exact: true }).locator("..").getByText("1", { exact: true })).toBeVisible();
  await expect(page.getByText("20,000").first()).toBeVisible();
});

test("organiser can sign up and create an event through the UI", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Organisation or promoter name").fill("UI Org");
  await page.getByLabel("First name").fill("Uwase");
  await page.getByLabel("Email (your username)").fill(`ui-${suffix}@example.com`);
  await page.getByLabel("Password").fill("ui-pass-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/organiser$/);
  await expect(page.getByText("No events yet")).toBeVisible();

  await page.goto("/organiser/events/new");
  await page.getByLabel("Event title").fill(`UI Event ${suffix}`);
  await page.getByLabel("Artist or headline act").fill("Someone");
  await page.getByLabel("Venue").fill("Huye");
  await page.getByLabel("Date and time").fill("2030-05-01T18:00");
  await page.getByLabel("Poster image URL").fill("https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800");
  await page.getByLabel("Price").first().fill("3000");
  await page.getByRole("button", { name: "Publish event" }).click();
  await expect(page).toHaveURL(/\/organiser\/events\/[0-9a-f]{24}$/);
  await expect(page.getByText(`UI Event ${suffix}`)).toBeVisible();
});

test("gate staff created by an organiser can admit a ticket from the scan page", async ({ page, request }) => {
  const { token, event } = await seed(request);
  // one ticket via mock payment
  const pay = await request.post(`${API}/momo/requestToPay`, {
    data: { amount: "5000", currency: "RWF", payer: { partyIdType: "MSISDN", partyId: "250788000111" }, eventId: event._id, ticketPackage: event.packages[0], quantity: 1 },
  });
  const { refId } = await pay.json();
  const status = await request.get(`${API}/momo/statusOfRequest/${refId}`);
  const { tickets } = await status.json();
  const number = String(tickets[0].number);

  const staffEmail = `gate-${suffix}@example.com`;
  const created = await request.post(`${API}/users/staff`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { firstName: "Gate", email: staffEmail, password: "gate-pass-1" },
  });
  expect(created.ok()).toBeTruthy();

  await page.goto("/scan");
  await page.getByLabel("Your username").fill(staffEmail);
  await page.getByLabel("Password").fill("gate-pass-1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Scan tickets" })).toBeVisible();

  await page.getByLabel("Ticket number").fill(number);
  await page.getByRole("button", { name: "Admit" }).click();
  await expect(page.getByText(`Admit ticket ${number}`).first()).toBeVisible();

  // second scan is refused
  await page.getByLabel("Ticket number").fill(number);
  await page.getByRole("button", { name: "Admit" }).click();
  await expect(page.getByText("Already used").first()).toBeVisible();
});
