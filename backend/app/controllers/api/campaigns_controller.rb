class Api::CampaignsController < Api::ApplicationController
  before_action :set_campaign, only: [:show, :entry, :reviews]
  before_action :authenticate_user!, only: [:entry]

  def index
    @campaigns = Campaign.active_campaigns.current
    @campaigns = @campaigns.recent if params[:sort] == 'new'
    @campaigns = @campaigns.limit(3) if params[:recommend] == 'true'
    @campaigns = @campaigns.page(params[:page]).per(params[:per_page] || 20)
    
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

  def entry
    return render_error('既に応募済みです') if already_applied?
    return render_error('応募期間外です') unless @campaign.application_period?

    @entry = @campaign.entries.build(user: current_user)
    
    if @entry.save
      render_success({ entry: entry_json(@entry) }, '応募が完了しました')
    else
      render_error('応募に失敗しました')
    end
  end

  def reviews
    @reviews = @campaign.reviews.recent.page(params[:page]).per(params[:per_page] || 10)
    
    render json: {
      reviews: @reviews.map { |r| review_json(r) },
      total: @reviews.total_count,
      page: @reviews.current_page,
      per_page: @reviews.limit_value
    }
  end

  private

  def set_campaign
    @campaign = Campaign.find(params[:id])
  end

  def already_applied?
    current_user&.entries&.exists?(campaign: @campaign)
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
      average_rating: campaign.average_rating,
      company: {
        name: campaign.company.name
      }
    }
  end

  def campaign_detail_json(campaign)
    campaign_json(campaign).merge(
      company: {
        name: campaign.company.name,
        url: campaign.company.url
      },
      can_apply: user_signed_in? && !already_applied? && campaign.application_period?
    )
  end

  def entry_json(entry)
    {
      id: entry.id,
      status: entry.status,
      created_at: entry.created_at
    }
  end

  def review_json(review)
    {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      user: {
        name: review.user.name
      }
    }
  end
end