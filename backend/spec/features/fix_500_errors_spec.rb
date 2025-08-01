require 'rails_helper'

RSpec.describe "500 Error Fixes", type: :request do
  let!(:admin) { create_admin }
  let!(:user) { create_user }
  let!(:company) { create_company }
  let!(:campaign) { create_campaign(company) }
  let!(:entry) { create_entry(user, campaign) }

  describe "Fixed Route Issues" do
    context "Campaign entry route" do
      before { sign_in user }

      it "GET /campaigns/:id/entry uses correct route name" do
        new_campaign = create_campaign(company, title: "New Campaign for Entry")
        get "/campaigns/#{new_campaign.id}/entry"
        expect(response).to have_http_status(200)
        # Check that the route helper works (no NoMethodError)
        expect(response.body).not_to include("undefined method")
      end

      it "POST /campaigns/:id/entry redirects to correct done path" do
        new_campaign = create_campaign(company, title: "Another Campaign")
        post "/campaigns/#{new_campaign.id}/entry"
        # Should redirect to the done page (not 500 error)
        expect(response.status).to be_in([200, 302])
        expect(response).not_to have_http_status(500)
      end
    end

    context "Campaign show page" do
      it "GET /campaigns/:id renders without route errors" do
        get "/campaigns/#{campaign.id}"
        expect(response).to have_http_status(200)
        # Check that the view doesn't contain route errors
        expect(response.body).not_to include("undefined method")
        expect(response.body).not_to include("campaign_entry_path")
      end
    end
  end

  describe "Fixed Admin View Templates" do
    before { sign_in admin, scope: :admin }

    it "GET /admin/entries returns 200 (not missing template error)" do
      get "/admin/entries"
      expect(response).to have_http_status(200)
      expect(response.body).to include("応募管理")
    end

    it "GET /admin/campaigns returns 200 (not missing template error)" do
      get "/admin/campaigns"
      expect(response).to have_http_status(200)
      expect(response.body).to include("案件管理")
    end

    it "GET /admin/shipments returns 200 (not missing template error)" do
      get "/admin/shipments"
      expect(response).to have_http_status(200)
      expect(response.body).to include("配送管理")
    end

    it "GET /admin/reviews returns 200 (not missing template error)" do
      get "/admin/reviews"
      expect(response).to have_http_status(200)
      expect(response.body).to include("レビュー管理")
    end
  end

  describe "Admin templates render correctly with data" do
    before { sign_in admin, scope: :admin }

    it "Admin entries page displays entry information" do
      get "/admin/entries"
      expect(response).to have_http_status(200)
      expect(response.body).to include(entry.user.email)
      expect(response.body).to include(entry.campaign.title)
    end

    it "Admin campaigns page displays campaign information" do
      get "/admin/campaigns"
      expect(response).to have_http_status(200)
      expect(response.body).to include(campaign.title)
      expect(response.body).to include(campaign.company.name)
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