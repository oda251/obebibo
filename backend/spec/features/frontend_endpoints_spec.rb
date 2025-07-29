require 'rails_helper'

RSpec.describe "Frontend Endpoints E2E Tests", type: :request do
  let!(:admin) { create_admin }
  let!(:user) { create_user }
  let!(:company) { create_company }
  let!(:campaign) { create_campaign(company) }
  let!(:entry) { create_entry(user, campaign) }

  describe "Public endpoints (should return 200)" do
    it "GET / (homepage)" do
      get "/"
      expect(response).to have_http_status(200)
    end

    it "GET /campaigns (campaign listing)" do
      get "/campaigns"
      expect(response).to have_http_status(200)
    end

    it "GET /terms (terms page)" do
      get "/terms"
      expect(response).to have_http_status(200)
    end

    it "GET /privacy (privacy page)" do
      get "/privacy"
      expect(response).to have_http_status(200)
    end

    it "GET /inquiry (inquiry page)" do
      get "/inquiry"
      expect(response).to have_http_status(200)
    end

    it "GET /login (login form)" do
      get "/login"
      expect(response).to have_http_status(200)
    end

    it "GET /register (registration form)" do
      get "/register"
      expect(response).to have_http_status(200)
    end
  end

  describe "Campaign endpoints" do
    it "GET /campaigns/:id (campaign details)" do
      get "/campaigns/#{campaign.id}"
      expect(response).to have_http_status(200)
    end

    context "when user is not authenticated" do
      it "GET /campaigns/:id/entry redirects to login" do
        get "/campaigns/#{campaign.id}/entry"
        expect(response).to redirect_to(new_user_session_path)
      end

      it "GET /campaigns/:id/entry/done redirects to login" do
        get "/campaigns/#{campaign.id}/entry/done"
        expect(response).to redirect_to(new_user_session_path)
      end
    end

    context "when user is authenticated" do
      before { sign_in user }

      it "GET /campaigns/:id/entry shows entry form" do
        new_campaign = create_campaign(company, title: "New Campaign")
        get "/campaigns/#{new_campaign.id}/entry"
        expect(response).to have_http_status(200)
      end

      it "GET /campaigns/:id/entry/done shows completion page when user has applied" do
        get "/campaigns/#{campaign.id}/entry/done"
        expect(response).to have_http_status(200)
      end
    end
  end

  describe "User authenticated endpoints" do
    context "when user is not authenticated" do
      it "GET /mypage redirects to login" do
        get "/mypage"
        expect(response).to redirect_to(new_user_session_path)
      end

      it "GET /mypage/review/:id redirects to login" do
        get "/mypage/review/#{campaign.id}"
        expect(response).to redirect_to(new_user_session_path)
      end
    end

    context "when user is authenticated" do
      before { sign_in user }

      it "GET /mypage shows user dashboard" do
        get "/mypage"
        expect(response).to have_http_status(200)
      end

      it "GET /mypage/review/:id handles review requests" do
        get "/mypage/review/#{campaign.id}"
        expect(response.status).to be_in([200, 302])
      end
    end
  end

  describe "Admin endpoints" do
    context "when admin is not authenticated" do
      it "GET /admin redirects to admin login" do
        get "/admin"
        expect(response).to redirect_to(new_admin_session_path)
      end

      it "GET /admin/campaigns redirects to admin login" do
        get "/admin/campaigns"
        expect(response).to redirect_to(new_admin_session_path)
      end

      it "GET /admin/campaigns/:id/entries redirects to admin login" do
        get "/admin/campaigns/#{campaign.id}/entries"
        expect(response).to redirect_to(new_admin_session_path)
      end

      it "GET /admin/shipments redirects to admin login" do
        get "/admin/shipments"
        expect(response).to redirect_to(new_admin_session_path)
      end

      it "GET /admin/reviews redirects to admin login" do
        get "/admin/reviews"
        expect(response).to redirect_to(new_admin_session_path)
      end
    end

    context "when admin is authenticated" do
      before { sign_in admin, scope: :admin }

      it "GET /admin shows admin dashboard" do
        get "/admin"
        expect(response).to have_http_status(200)
      end

      it "GET /admin/campaigns shows campaign management" do
        get "/admin/campaigns"
        expect(response).to have_http_status(200)
      end

      it "GET /admin/campaigns/:id/entries shows entry management" do
        get "/admin/campaigns/#{campaign.id}/entries"
        expect(response).to have_http_status(200)
      end

      it "GET /admin/shipments shows shipment management" do
        get "/admin/shipments"
        expect(response).to have_http_status(200)
      end

      it "GET /admin/reviews shows review management" do
        get "/admin/reviews"
        expect(response).to have_http_status(200)
      end
    end
  end

  private

  def create_admin
    Admin.create!(
      name: "Test Admin",
      email: "admin@test.com",
      password: "password",
      password_confirmation: "password"
    )
  end

  def create_user
    User.create!(
      email: "user@test.com",
      password: "password",
      password_confirmation: "password"
    )
  end

  def create_company
    Company.create!(
      name: "Test Company",
      email: "company@test.com",
      contact_name: "Test Contact",
      contact_phone: "03-1234-5678",
      postal_code: "100-0001",
      prefecture: "東京都",
      city: "千代田区",
      address1: "テスト1-1-1",
      url: "https://test.com"
    )
  end

  def create_campaign(company, title: "Test Campaign")
    Campaign.create!(
      title: title,
      description: "Test campaign description",
      company: company,
      image_url: "https://example.com/image.jpg",
      start_at: 1.week.ago,
      end_at: 1.month.from_now,
      status: 'active'
    )
  end

  def create_entry(user, campaign, status: 'pending')
    Entry.create!(
      user: user,
      campaign: campaign,
      status: status
    )
  end
end