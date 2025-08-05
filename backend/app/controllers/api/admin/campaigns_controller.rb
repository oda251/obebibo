class Api::Admin::CampaignsController < Api::ApplicationController
  before_action :authenticate_admin!
  before_action :set_campaign, only: [:show, :update, :destroy]

  def index
    @campaigns = Campaign.includes(:company).recent.page(params[:page]).per(params[:per_page] || 20)
    
    render json: {
      campaigns: @campaigns.map { |c| campaign_json(c) },
      total: @campaigns.total_count,
      page: @campaigns.current_page,
      per_page: @campaigns.limit_value
    }
  end

  def show
    render json: { campaign: campaign_detail_json(@campaign) }
  end

  def create
    @campaign = Campaign.new(campaign_params)
    
    if @campaign.save
      render_success({ campaign: campaign_json(@campaign) }, 'キャンペーンが作成されました')
    else
      render_error(@campaign.errors.full_messages.join(', '))
    end
  end

  def update
    if @campaign.update(campaign_params)
      render_success({ campaign: campaign_json(@campaign) }, 'キャンペーンが更新されました')
    else
      render_error(@campaign.errors.full_messages.join(', '))
    end
  end

  def destroy
    @campaign.destroy
    render_success({}, 'キャンペーンが削除されました')
  end

  private

  def set_campaign
    @campaign = Campaign.find(params[:id])
  end

  def campaign_params
    params.require(:campaign).permit(:company_id, :title, :description, :image_url, :start_at, :end_at, :status)
  end

  def campaign_json(campaign)
    {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      image_url: campaign.image_url,
      start_at: campaign.start_at,
      end_at: campaign.end_at,
      status: campaign.status,
      entry_count: campaign.entry_count,
      winner_count: campaign.winner_count,
      average_rating: campaign.average_rating,
      company: {
        id: campaign.company.id,
        name: campaign.company.name
      },
      created_at: campaign.created_at,
      updated_at: campaign.updated_at
    }
  end

  def campaign_detail_json(campaign)
    campaign_json(campaign).merge(
      company: {
        id: campaign.company.id,
        name: campaign.company.name,
        email: campaign.company.email,
        url: campaign.company.url
      }
    )
  end

  def authenticate_admin!
    render_error('管理者権限が必要です', :unauthorized) unless admin_signed_in?
  end
end